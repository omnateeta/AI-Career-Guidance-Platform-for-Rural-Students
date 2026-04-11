import { useState, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import { FaGraduationCap, FaSpinner, FaMicrophone, FaVolumeUp, FaArrowLeft } from 'react-icons/fa';
import CareerNode from '../components/career/CareerNode';
import CareerDetailsPanel from '../components/career/CareerDetailsPanel';
import { AuthContext } from '../context/AuthContext';

const educationLevels = [
  { id: '10th', label: '10th Standard', icon: '📚', description: 'Secondary School' },
  { id: '12th', label: '12th Standard (PUC)', icon: '🎓', description: 'Higher Secondary' },
  { id: 'Diploma', label: 'Diploma', icon: '📜', description: 'Polytechnic/ITI' },
  { id: 'Degree', label: 'Degree', icon: '🏆', description: 'Graduation' },
];

const nodeTypes = {
  education: CareerNode,
  stream: CareerNode,
  degree: CareerNode,
  specialization: CareerNode,
  career: CareerNode,
  job: CareerNode,
  certification: CareerNode,
};

const CareerGuidanceFlow = () => {
  const { token } = useContext(AuthContext);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedEducation, setSelectedEducation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [listening, setListening] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Handle education level selection
  const handleEducationSelect = async (level) => {
    setSelectedEducation(level);
    setLoading(true);
    setNodes([]);
    setEdges([]);
    setExpandedNodes(new Set());

    try {
      const response = await axios.post('/api/career/generate-paths', {
        educationLevel: level,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { nodes: initialNodes, sessionId: newSessionId } = response.data.data;
      setSessionId(newSessionId);

      // Transform to React Flow nodes
      const flowNodes = initialNodes.map((node, index) => ({
        id: node.nodeId,
        type: node.category,
        position: { x: index * 300, y: 0 },
        data: node,
      }));

      setNodes(flowNodes);
    } catch (error) {
      console.error('Error generating paths:', error);
      if (error.response?.status === 401) {
        alert('Please login to access career guidance.');
        window.location.href = '/login';
      } else {
        alert('Failed to generate career paths. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle node click to expand
  const onNodeClick = useCallback(
    async (event, node) => {
      // Defensive check
      if (!node || !node.id) {
        console.error('Invalid node clicked');
        return;
      }

      console.log('Node clicked:', node.id, 'Category:', node.data.category);

      // Check if this is a leaf node (career/job) - always show details
      if (node.data.category === 'career' || node.data.category === 'job') {
        console.log('Showing details for leaf node');
        setSelectedNode(node.data);
        setShowDetails(true);
        return;
      }

      if (expandedNodes.has(node.id)) {
        // If already expanded, show details
        console.log('Node already expanded, showing details');
        setSelectedNode(node.data);
        setShowDetails(true);
        return;
      }

      setLoading(true);

      try {
        const response = await axios.post(`/api/career/expand-node/${node.id}`, {
          sessionId,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { children } = response.data.data;

        // Calculate positions for children
        const parentPosition = node.position;
        const newNodes = children.map((child, index) => {
          const totalChildren = children.length;
          const spacing = 280;
          const startX = parentPosition.x - (totalChildren - 1) * (spacing / 2);

          return {
            id: child.nodeId,
            type: child.category,
            position: {
              x: startX + index * spacing,
              y: parentPosition.y + 250,
            },
            data: child,
          };
        });

        // Add edges from parent to children
        const newEdges = children.map((child) => ({
          id: `${node.id}-${child.nodeId}`,
          source: node.id,
          target: child.nodeId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#3B82F6', strokeWidth: 2 },
        }));

        setNodes((nds) => [...nds, ...newNodes]);
        setEdges((eds) => [...eds, ...newEdges]);
        setExpandedNodes((prev) => new Set([...prev, node.id]));

        // Fit view to show new nodes
        setTimeout(() => {
          if (reactFlowInstance) {
            reactFlowInstance.fitView({ padding: 0.2, duration: 500 });
          }
        }, 100);
      } catch (error) {
        console.error('Error expanding node:', error);
        alert('Failed to expand node. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [expandedNodes, sessionId, token]
  );

  // Voice navigation
  const startVoiceNavigation = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition is not supported in your browser');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      handleVoiceCommand(command);
    };

    recognition.start();
  };

  const handleVoiceCommand = (command) => {
    if (command.includes('explain') || command.includes('details')) {
      if (selectedNode) {
        speakText(selectedNode.description);
      }
    }
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // Reset flow
  const handleReset = () => {
    setSelectedEducation(null);
    setNodes([]);
    setEdges([]);
    setExpandedNodes(new Set());
    setSelectedNode(null);
    setShowDetails(false);
    setSessionId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {selectedEducation && (
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <FaArrowLeft />
                  <span>Back</span>
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gradient">AI Career Guidance</h1>
                <p className="text-sm text-gray-600">
                  {selectedEducation
                    ? `Exploring paths after ${selectedEducation}`
                    : 'Discover your perfect career path with AI'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={startVoiceNavigation}
                className={`p-2 rounded-lg transition-colors ${
                  listening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Voice Navigation"
              >
                <FaMicrophone />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Education Level Selector */}
      {!selectedEducation && (
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">What have you completed?</h2>
            <p className="text-xl text-gray-600">
              Select your education level to explore all possible career paths
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {educationLevels.map((level, index) => (
              <motion.button
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleEducationSelect(level.id)}
                disabled={loading}
                className="clay-card p-8 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <div className="text-5xl mb-4">{level.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{level.label}</h3>
                <p className="text-sm text-gray-600">{level.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* React Flow Canvas */}
      {selectedEducation && (
        <div className="h-[calc(100vh-80px)]">
          {loading && nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FaSpinner className="animate-spin text-6xl text-primary-600 mx-auto mb-4" />
                <p className="text-xl text-gray-600">AI is generating career paths...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              onInit={setReactFlowInstance}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={{
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#3B82F6', strokeWidth: 2 },
              }}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.1}
              maxZoom={1.5}
            >
              <Background color="#aaa" gap={16} />
              <Controls />
              <MiniMap
                nodeStrokeColor={(n) => {
                  if (n.type === 'career') return '#10B981';
                  if (n.type === 'degree') return '#6366F1';
                  return '#3B82F6';
                }}
                nodeColor={(n) => {
                  if (n.type === 'career') return '#D1FAE5';
                  if (n.type === 'degree') return '#E0E7FF';
                  return '#DBEAFE';
                }}
              />
            </ReactFlow>
          )}

          {/* Loading overlay for node expansion */}
          {loading && nodes.length > 0 && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
              <div className="clay-card px-6 py-3 bg-white/90 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-primary-600" />
                  <span className="text-sm font-medium">Loading options...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Career Details Panel */}
      <AnimatePresence>
        {showDetails && selectedNode && (
          <CareerDetailsPanel
            node={selectedNode}
            onClose={() => setShowDetails(false)}
            onSpeak={speakText}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CareerGuidanceFlow;
