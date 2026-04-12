import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaMapMarkerAlt, 
  FaUniversity, 
  FaSearch, 
  FaExternalLinkAlt,
  FaRedo,
  FaInfoCircle,
  FaRoute,
  FaGraduationCap,
  FaMap
} from 'react-icons/fa'
import axios from 'axios'

const NearbyCollegesPage = () => {
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [location, setLocation] = useState(null)
  const [searchRadius, setSearchRadius] = useState(5000) // 5km default
  const [collegeType, setCollegeType] = useState('all')
  const [locationPermission, setLocationPermission] = useState('pending') // pending, granted, denied
  
  // City search state
  const [searchMode, setSearchMode] = useState('gps') // 'gps' or 'city'
  const [cityName, setCityName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Map state
  const [showMap, setShowMap] = useState(true)
  const mapRef = useRef(null)

  // Fetch nearby colleges
  const fetchColleges = async (lat, lng) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching colleges near:', { lat, lng, radius: searchRadius, type: collegeType })
      
      const response = await axios.get('/api/colleges/nearby', {
        params: {
          lat,
          lng,
          radius: searchRadius,
          type: collegeType,
          limit: 20,
        },
      })

      console.log('✅ Colleges response:', response.data)
      
      const data = response.data.data || response.data.success
      setColleges(data.colleges || [])
      setLocation({
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        ...data.location,
      })
    } catch (error) {
      console.error('❌ Error fetching colleges:', error)
      setError(error.response?.data?.message || 'Failed to fetch colleges')
      setColleges([])
    } finally {
      setLoading(false)
    }
  }

  // Search colleges by city name
  const searchCollegesByCity = async (city) => {
    if (!city || city.trim().length === 0) {
      setError('Please enter a city name')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSearchMode('city')
      setCityName(city.trim())
      
      console.log('🏙️ Searching colleges for city:', city)
      
      const response = await axios.get('/api/colleges/by-city', {
        params: {
          city: city.trim(),
          radius: searchRadius,
          type: collegeType,
          limit: 20,
        },
      })

      console.log('✅ City search response:', response.data)
      
      const data = response.data.data || response.data.success
      setColleges(data.colleges || [])
      setLocation({
        ...data.location,
        searchMode: 'city',
      })
      setSearchQuery(city.trim())
    } catch (error) {
      console.error('❌ Error searching colleges by city:', error)
      setError(error.response?.data?.message || 'Failed to search colleges')
      setColleges([])
    } finally {
      setLoading(false)
    }
  }

  // Get user location
  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLocationPermission('denied')
      return
    }

    setLocationPermission('pending')
    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        
        console.log('📍 Location obtained:', { lat, lng })
        setLocationPermission('granted')
        fetchColleges(lat, lng)
      },
      (error) => {
        console.error('❌ Location error:', error)
        setLocationPermission('denied')
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access in your browser settings.')
            break
          case error.POSITION_UNAVAILABLE:
            setError('Location information unavailable.')
            break
          case error.TIMEOUT:
            setError('Location request timed out.')
            break
          default:
            setError('An unknown error occurred while getting your location.')
        }
        
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  // Get location on component mount
  useEffect(() => {
    getLocation()
  }, [])

  // Handle refresh
  const handleRefresh = () => {
    if (searchMode === 'city' && cityName) {
      // Refresh city search
      searchCollegesByCity(cityName)
    } else if (location) {
      // Refresh GPS search
      fetchColleges(location.lat, location.lng)
    } else {
      getLocation()
    }
  }

  // Handle city search submit
  const handleCitySearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      searchCollegesByCity(searchQuery)
    }
  }

  // Switch to GPS mode
  const switchToGPS = () => {
    setSearchMode('gps')
    setCityName('')
    setSearchQuery('')
    setLocation(null)
    getLocation()
  }

  // Open in Google Maps
  const openInMaps = (lat, lng, name) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}&q=${encodeURIComponent(name)}`
    window.open(url, '_blank')
  }

  // Get directions
  const getDirections = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    window.open(url, '_blank')
  }

  // Generate Google Maps Embed URL with markers for all colleges
  const getMapEmbedUrl = () => {
    if (!location || colleges.length === 0) return ''
    
    // Use the searched location or first college as center
    const centerLat = location.lat || colleges[0].lat
    const centerLng = location.lng || colleges[0].lng
    
    // If we have user's GPS location, show directions from current location to city
    if (navigator.geolocation && searchMode === 'city') {
      // Get user's current location for origin
      return `https://maps.google.com/maps?q=colleges+near+${encodeURIComponent(location.city || cityName)}&z=12&output=embed`
    }
    
    // Create a search query for colleges in the area
    const searchQuery = encodeURIComponent(`colleges near ${centerLat},${centerLng}`)
    
    // Use Google Maps Embed API (view mode - no API key required)
    return `https://maps.google.com/maps?q=${searchQuery}&z=13&output=embed`
  }

  // Open full Google Maps with all colleges and directions from current location
  const openFullMap = () => {
    if (!location || colleges.length === 0) return
    
    const centerLat = location.lat || colleges[0].lat
    const centerLng = location.lng || colleges[0].lng
    
    // If city search mode, show colleges in that city
    if (searchMode === 'city' && location.city) {
      const url = `https://www.google.com/maps/search/colleges+and+universities+near+${encodeURIComponent(location.city)}/@${centerLat},${centerLng},13z`
      window.open(url, '_blank')
    } else {
      // GPS mode - show nearby colleges
      const url = `https://www.google.com/maps/search/colleges+and+universities/@${centerLat},${centerLng},13z`
      window.open(url, '_blank')
    }
  }

  // Get directions from user's current location to a specific college
  const getDirectionsFromCurrentLocation = (collegeLat, collegeLng, collegeName) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLat = position.coords.latitude
          const currentLng = position.coords.longitude
          const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLat},${currentLng}&destination=${collegeLat},${collegeLng}`
          window.open(url, '_blank')
        },
        (error) => {
          // If location not available, just show directions to college
          const url = `https://www.google.com/maps/dir/?api=1&destination=${collegeLat},${collegeLng}`
          window.open(url, '_blank')
        }
      )
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${collegeLat},${collegeLng}`
      window.open(url, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pt-28 md:pt-32 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg mb-4">
            <FaMapMarkerAlt className="text-3xl text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Nearby Colleges Finder
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover real colleges and universities near your location using OpenStreetMap data
          </p>
        </motion.div>

        {/* Location Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          {/* Search Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={switchToGPS}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                searchMode === 'gps'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaMapMarkerAlt />
              <span className="font-medium">Use My Location</span>
            </button>
            <button
              onClick={() => setSearchMode('city')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                searchMode === 'city'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaSearch />
              <span className="font-medium">Search by City</span>
            </button>
          </div>

          {/* City Search Form */}
          {searchMode === 'city' && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleCitySearch}
              className="mb-4"
            >
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter city name (e.g., Mysuru, Bangalore, Delhi)..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition text-lg"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !searchQuery.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <FaSearch />
                  {loading ? 'Searching...' : 'Search Colleges'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                💡 Try: Mysuru, Bangalore, Chennai, Hyderabad, Delhi, Mumbai, Kolkata, Pune
              </p>
            </motion.form>
          )}

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {searchMode === 'city' && location?.city && (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">🏙️ Showing results for:</span> {location.city}
                    {location.displayName && (
                      <span className="text-gray-500 ml-2">({location.displayName.split(',')[0]})</span>
                    )}
                  </p>
                </>
              )}
              {searchMode === 'gps' && locationPermission === 'granted' && (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">📍 Location:</span> {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
                  </p>
                </>
              )}
              {searchMode === 'gps' && locationPermission === 'denied' && (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <p className="text-sm text-red-600 font-medium">Location access denied</p>
                </>
              )}
              {searchMode === 'gps' && locationPermission === 'pending' && (
                <>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-yellow-600">Requesting location...</p>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Radius Selector */}
              <select
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
              >
                <option value={3000}>3 km</option>
                <option value={5000}>5 km</option>
                <option value={10000}>10 km</option>
                <option value={15000}>15 km</option>
                <option value={20000}>20 km</option>
              </select>

              {/* Type Selector */}
              <select
                value={collegeType}
                onChange={(e) => setCollegeType(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
              >
                <option value="all">All Colleges</option>
                <option value="engineering">Engineering</option>
                <option value="medical">Medical</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50"
              >
                <FaRedo className={loading ? 'animate-spin' : ''} />
                {loading ? 'Searching...' : 'Refresh'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Google Maps Section */}
        <AnimatePresence>
          {!loading && colleges.length > 0 && showMap && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6"
            >
              {/* Map Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaMap className="text-white text-xl" />
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      {searchMode === 'city' ? `Colleges in ${location.city || cityName}` : 'Colleges Map View'}
                    </h3>
                    <p className="text-white/80 text-sm">
                      Showing {colleges.length} colleges • {searchMode === 'city' ? 'From your current location' : 'Near your location'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={openFullMap}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition text-sm font-medium"
                  >
                    <FaExternalLinkAlt />
                    Open Full Map
                  </button>
                  <button
                    onClick={() => setShowMap(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition text-sm font-medium"
                  >
                    Hide Map
                  </button>
                </div>
              </div>

              {/* Map Container */}
              <div className="relative w-full h-[500px] bg-gray-100">
                <iframe
                  ref={mapRef}
                  src={getMapEmbedUrl()}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                  title="Colleges Map"
                />
              </div>

              {/* Map Legend */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center gap-4 flex-wrap text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span>Colleges & Universities in {location.city || 'this area'}</span>
                  </div>
                  {searchMode === 'city' && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Showing from your current location</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FaRoute className="text-purple-600" />
                    <span>Click "Get Directions" for navigation from your location</span>
                  </div>
                  <button
                    onClick={openFullMap}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    View larger map with more details →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show Map Button (when map is hidden) */}
        {!loading && colleges.length > 0 && !showMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <button
              onClick={() => setShowMap(true)}
              className="w-full bg-white rounded-2xl shadow-lg p-4 flex items-center justify-center gap-3 hover:shadow-xl transition"
            >
              <FaMap className="text-blue-600 text-xl" />
              <span className="font-medium text-gray-700">Show Map View</span>
            </button>
          </motion.div>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6"
            >
              <div className="flex items-start gap-3">
                <FaInfoCircle className="text-red-600 text-xl mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-red-800 font-semibold mb-2">Error</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                  {locationPermission === 'denied' && (
                    <button
                      onClick={getLocation}
                      className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && colleges.length === 0 && locationPermission === 'granted' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <FaUniversity className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Colleges Found</h3>
            <p className="text-gray-500 mb-6">
              Try increasing the search radius or changing the college type
            </p>
            <button
              onClick={() => {
                setSearchRadius(prev => Math.min(prev + 5000, 20000))
                handleRefresh()
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition"
            >
              Increase Search Radius
            </button>
          </motion.div>
        )}

        {/* Colleges List */}
        {!loading && colleges.length > 0 && (
          <>
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <FaGraduationCap className="text-2xl text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{colleges.length}</p>
                    <p className="text-sm text-gray-600">Colleges Found</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaRoute className="text-2xl text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {colleges[0]?.distanceText || '0 km'}
                    </p>
                    <p className="text-sm text-gray-600">Nearest College</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* College Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {colleges.map((college, index) => (
                  <motion.div
                    key={`${college.name}-${college.lat}-${college.lng}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-white font-bold text-lg flex-1 pr-2">
                          {college.name}
                        </h3>
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                          {college.distanceText}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm mt-1 capitalize">
                        {college.type}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      {/* Address */}
                      {college.address && (
                        <div className="flex items-start gap-2">
                          <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{college.address}</p>
                        </div>
                      )}

                      {/* Operator */}
                      {college.operator && (
                        <div className="flex items-start gap-2">
                          <FaUniversity className="text-gray-400 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{college.operator}</p>
                        </div>
                      )}

                      {/* Website */}
                      {college.website && (
                        <div className="flex items-start gap-2">
                          <FaExternalLinkAlt className="text-gray-400 mt-1 flex-shrink-0" />
                          <a
                            href={college.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline truncate"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => openInMaps(college.lat, college.lng, college.name)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                        >
                          <FaMapMarkerAlt />
                          View Map
                        </button>
                        <button
                          onClick={() => getDirectionsFromCurrentLocation(college.lat, college.lng, college.name)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition text-sm font-medium"
                        >
                          <FaRoute />
                          Get Directions
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default NearbyCollegesPage
