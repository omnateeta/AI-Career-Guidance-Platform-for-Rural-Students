const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Mentor = require('../models/Mentor');
require('dotenv').config();

const sampleMentors = [
  {
    user: {
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@mentor.com',
      password: 'mentor123',
      role: 'mentor',
      profile: {
        avatar: '👨‍💻',
        location: 'Bangalore, Karnataka'
      }
    },
    mentor: {
      profile: {
        bio: '10+ years in software engineering at top tech companies. Passionate about mentoring rural students and helping them break into tech. I believe anyone from any background can succeed in tech with proper guidance.',
        tagline: 'Senior Software Engineer turned Mentor',
        yearsOfExperience: 12,
        currentRole: 'Senior Software Engineer',
        currentCompany: 'Google',
        linkedIn: 'https://linkedin.com/in/rajeshkumar'
      },
      expertise: ['System Design', 'Career Growth', 'Tech Interviews', 'JavaScript', 'React', 'Node.js'],
      industries: ['Technology', 'Software Development', 'Cloud Computing'],
      languagesSpoken: ['English', 'Hindi', 'Kannada'],
      availability: {
        status: 'available',
        maxStudents: 10,
        currentStudents: 3,
        availableHours: [
          { day: 'monday', startTime: '6:00 PM', endTime: '8:00 PM' },
          { day: 'wednesday', startTime: '6:00 PM', endTime: '8:00 PM' },
          { day: 'saturday', startTime: '10:00 AM', endTime: '2:00 PM' },
          { day: 'sunday', startTime: '10:00 AM', endTime: '12:00 PM' }
        ]
      },
      responseTime: 'within 2 hours',
      isVerified: true,
      isFeatured: true,
      totalSessions: 127,
      rating: { average: 4.9, count: 45 },
      reviews: [
        {
          rating: 5,
          comment: 'Amazing mentor! Helped me land my first tech job.',
          createdAt: new Date('2024-01-15')
        },
        {
          rating: 5,
          comment: 'Very patient and knowledgeable. Highly recommend!',
          createdAt: new Date('2024-02-20')
        }
      ]
    }
  },
  {
    user: {
      name: 'Priya Sharma',
      email: 'priya.sharma@mentor.com',
      password: 'mentor123',
      role: 'mentor',
      profile: {
        avatar: '👩‍💻',
        location: 'Pune, Maharashtra'
      }
    },
    mentor: {
      profile: {
        bio: 'Data Scientist with expertise in Machine Learning and AI. I transitioned from a non-tech background (Biology) to Data Science, so I understand the challenges rural students face. Here to make your journey easier!',
        tagline: 'Making Data Science accessible to everyone',
        yearsOfExperience: 8,
        currentRole: 'Data Scientist',
        currentCompany: 'Microsoft',
        linkedIn: 'https://linkedin.com/in/priyasharma'
      },
      expertise: ['Machine Learning', 'Data Science', 'Python', 'Statistics', 'Deep Learning', 'AI Ethics'],
      industries: ['Technology', 'Healthcare', 'Finance', 'E-commerce'],
      languagesSpoken: ['English', 'Hindi', 'Punjabi', 'Marathi'],
      availability: {
        status: 'available',
        maxStudents: 8,
        currentStudents: 5,
        availableHours: [
          { day: 'tuesday', startTime: '7:00 PM', endTime: '9:00 PM' },
          { day: 'thursday', startTime: '7:00 PM', endTime: '9:00 PM' },
          { day: 'saturday', startTime: '2:00 PM', endTime: '5:00 PM' }
        ]
      },
      responseTime: 'within 3 hours',
      isVerified: true,
      isFeatured: true,
      totalSessions: 98,
      rating: { average: 4.8, count: 38 },
      reviews: [
        {
          rating: 5,
          comment: 'Priya made ML concepts so easy to understand!',
          createdAt: new Date('2024-01-20')
        },
        {
          rating: 4,
          comment: 'Great mentor for beginners in data science.',
          createdAt: new Date('2024-03-10')
        }
      ]
    }
  },
  {
    user: {
      name: 'Amit Patel',
      email: 'amit.patel@mentor.com',
      password: 'mentor123',
      role: 'mentor',
      profile: {
        avatar: '👨‍💼',
        location: 'Mumbai, Maharashtra'
      }
    },
    mentor: {
      profile: {
        bio: 'Product Manager at Flipkart with an engineering background. I help students understand how to transition from coding to product management. Expert in strategy, leadership, and building products that millions use.',
        tagline: 'From Engineer to Product Leader',
        yearsOfExperience: 10,
        currentRole: 'Senior Product Manager',
        currentCompany: 'Flipkart',
        linkedIn: 'https://linkedin.com/in/amitpatel'
      },
      expertise: ['Product Management', 'Strategy', 'Leadership', 'User Research', 'Agile', 'Data-Driven Decisions'],
      industries: ['E-commerce', 'Technology', 'Fintech', 'Startups'],
      languagesSpoken: ['English', 'Hindi', 'Gujarati'],
      availability: {
        status: 'busy',
        maxStudents: 6,
        currentStudents: 6,
        availableHours: [
          { day: 'monday', startTime: '8:00 PM', endTime: '9:00 PM' },
          { day: 'friday', startTime: '8:00 PM', endTime: '9:00 PM' }
        ]
      },
      responseTime: 'within 24 hours',
      isVerified: true,
      isFeatured: false,
      totalSessions: 85,
      rating: { average: 4.7, count: 32 },
      reviews: [
        {
          rating: 5,
          comment: 'Amit helped me understand product thinking. Game changer!',
          createdAt: new Date('2024-02-05')
        }
      ]
    }
  },
  {
    user: {
      name: 'Sneha Reddy',
      email: 'sneha.reddy@mentor.com',
      password: 'mentor123',
      role: 'mentor',
      profile: {
        avatar: '👩‍🎨',
        location: 'Hyderabad, Telangana'
      }
    },
    mentor: {
      profile: {
        bio: 'Self-taught full stack developer from a small town in Andhra Pradesh. I proved that you don\'t need a fancy degree to succeed in tech. Now at Amazon, building features used by millions. Here to show you the way!',
        tagline: 'Small town girl, big tech dreams achieved',
        yearsOfExperience: 6,
        currentRole: 'Full Stack Developer',
        currentCompany: 'Amazon',
        linkedIn: 'https://linkedin.com/in/snehareddy',
        website: 'https://snehareddy.dev'
      },
      expertise: ['Web Development', 'React', 'Node.js', 'TypeScript', 'AWS', 'Career Transition'],
      industries: ['Technology', 'E-commerce', 'Cloud Services'],
      languagesSpoken: ['English', 'Telugu', 'Tamil'],
      availability: {
        status: 'available',
        maxStudents: 12,
        currentStudents: 7,
        availableHours: [
          { day: 'monday', startTime: '7:00 PM', endTime: '9:00 PM' },
          { day: 'wednesday', startTime: '7:00 PM', endTime: '9:00 PM' },
          { day: 'friday', startTime: '6:00 PM', endTime: '8:00 PM' },
          { day: 'sunday', startTime: '11:00 AM', endTime: '3:00 PM' }
        ]
      },
      responseTime: 'within 1 hour',
      isVerified: true,
      isFeatured: true,
      totalSessions: 156,
      rating: { average: 4.9, count: 62 },
      reviews: [
        {
          rating: 5,
          comment: 'Sneha\'s story is so inspiring! She made me believe I can do it too.',
          createdAt: new Date('2024-01-10')
        },
        {
          rating: 5,
          comment: 'Best mentor for web development. Very practical approach!',
          createdAt: new Date('2024-02-28')
        },
        {
          rating: 5,
          comment: 'Helped me build my first portfolio project. Thank you!',
          createdAt: new Date('2024-03-15')
        }
      ]
    }
  },
  {
    user: {
      name: 'Dr. Vikram Singh',
      email: 'vikram.singh@mentor.com',
      password: 'mentor123',
      role: 'mentor',
      profile: {
        avatar: '👨‍🏫',
        location: 'Delhi, NCR'
      }
    },
    mentor: {
      profile: {
        bio: 'Professor of Computer Science at IIT Delhi with 15+ years of teaching experience. I mentor students preparing for competitive exams and research careers. Published 50+ research papers in AI/ML.',
        tagline: 'Academic excellence meets industry relevance',
        yearsOfExperience: 15,
        currentRole: 'Professor & Researcher',
        currentCompany: 'IIT Delhi',
        linkedIn: 'https://linkedin.com/in/vikramsingh'
      },
      expertise: ['Artificial Intelligence', 'Research Methods', 'Competitive Programming', 'Algorithm Design', 'Academic Writing'],
      industries: ['Education', 'Research', 'Technology'],
      languagesSpoken: ['English', 'Hindi', 'Punjabi'],
      availability: {
        status: 'available',
        maxStudents: 5,
        currentStudents: 2,
        availableHours: [
          { day: 'tuesday', startTime: '4:00 PM', endTime: '6:00 PM' },
          { day: 'thursday', startTime: '4:00 PM', endTime: '6:00 PM' },
          { day: 'saturday', startTime: '9:00 AM', endTime: '12:00 PM' }
        ]
      },
      responseTime: 'within 12 hours',
      isVerified: true,
      isFeatured: true,
      totalSessions: 203,
      rating: { average: 5.0, count: 78 },
      reviews: [
        {
          rating: 5,
          comment: 'Dr. Singh is incredibly knowledgeable. Best academic mentor!',
          createdAt: new Date('2024-01-05')
        },
        {
          rating: 5,
          comment: 'Helped me get into IIT for Masters. Forever grateful!',
          createdAt: new Date('2024-03-01')
        }
      ]
    }
  },
  {
    user: {
      name: 'Ananya Iyer',
      email: 'ananya.iyer@mentor.com',
      password: 'mentor123',
      role: 'mentor',
      profile: {
        avatar: '👩‍🔬',
        location: 'Chennai, Tamil Nadu'
      }
    },
    mentor: {
      profile: {
        bio: 'Cybersecurity expert protecting Fortune 500 companies. First-generation tech professional from a rural village in Tamil Nadu. I\'m passionate about making cybersecurity accessible and helping students from non-metro cities break into this high-demand field.',
        tagline: 'Protecting the digital world, one student at a time',
        yearsOfExperience: 7,
        currentRole: 'Cybersecurity Analyst',
        currentCompany: 'Infosys',
        linkedIn: 'https://linkedin.com/in/ananyaier'
      },
      expertise: ['Cybersecurity', 'Ethical Hacking', 'Network Security', 'Risk Assessment', 'CISSP Preparation'],
      industries: ['Technology', 'Finance', 'Consulting', 'Government'],
      languagesSpoken: ['English', 'Tamil', 'Hindi'],
      availability: {
        status: 'available',
        maxStudents: 8,
        currentStudents: 4,
        availableHours: [
          { day: 'monday', startTime: '8:00 PM', endTime: '10:00 PM' },
          { day: 'wednesday', startTime: '8:00 PM', endTime: '10:00 PM' },
          { day: 'saturday', startTime: '3:00 PM', endTime: '6:00 PM' },
          { day: 'sunday', startTime: '3:00 PM', endTime: '6:00 PM' }
        ]
      },
      responseTime: 'within 4 hours',
      isVerified: true,
      isFeatured: false,
      totalSessions: 67,
      rating: { average: 4.8, count: 28 },
      reviews: [
        {
          rating: 5,
          comment: 'Ananya makes cybersecurity so interesting! Great mentor.',
          createdAt: new Date('2024-02-15')
        }
      ]
    }
  }
];

async function seedMentors() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/margdarshak-ai');
    console.log('✅ Connected to MongoDB');

    console.log('\n🗑️  Clearing existing mentor data...');
    await User.deleteMany({ role: 'mentor' });
    await Mentor.deleteMany({});
    console.log('✅ Cleared existing data');

    console.log('\n👥 Creating sample mentors...\n');

    for (const sample of sampleMentors) {
      console.log(`Creating mentor: ${sample.user.name}`);

      // Create user account
      const hashedPassword = await bcrypt.hash(sample.user.password, 10);
      const user = await User.create({
        ...sample.user,
        password: hashedPassword,
        isVerified: true
      });

      // Create mentor profile
      const mentor = await Mentor.create({
        userId: user._id,
        ...sample.mentor
      });

      console.log(`✅ Created: ${sample.user.name} (${sample.mentor.profile.currentRole} at ${sample.mentor.profile.currentCompany})`);
      console.log(`   Email: ${sample.user.email}`);
      console.log(`   Password: ${sample.user.password}`);
      console.log(`   Expertise: ${sample.mentor.expertise.slice(0, 3).join(', ')}...`);
      console.log(`   Rating: ${sample.mentor.rating.average}/5 (${sample.mentor.rating.count} reviews)`);
      console.log(`   Sessions: ${sample.mentor.totalSessions}`);
      console.log(`   Status: ${sample.mentor.availability.status}\n`);
    }

    console.log('✨ Sample mentors created successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Total mentors: ${sampleMentors.length}`);
    console.log(`   Available: ${sampleMentors.filter(m => m.mentor.availability.status === 'available').length}`);
    console.log(`   Busy: ${sampleMentors.filter(m => m.mentor.availability.status === 'busy').length}`);
    console.log(`   Featured: ${sampleMentors.filter(m => m.mentor.isFeatured).length}`);
    console.log(`   Total sessions: ${sampleMentors.reduce((acc, m) => acc + m.mentor.totalSessions, 0)}`);
    console.log(`   Average rating: ${(sampleMentors.reduce((acc, m) => acc + m.mentor.rating.average, 0) / sampleMentors.length).toFixed(1)}/5`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding mentors:', error);
    process.exit(1);
  }
}

seedMentors();
