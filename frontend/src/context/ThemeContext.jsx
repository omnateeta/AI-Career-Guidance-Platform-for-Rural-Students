import { createContext, useState, useContext } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [lowBandwidth, setLowBandwidth] = useState(
    localStorage.getItem('lowBandwidth') === 'true'
  )

  const toggleLowBandwidth = () => {
    setLowBandwidth(!lowBandwidth)
    localStorage.setItem('lowBandwidth', !lowBandwidth)
  }

  const value = {
    lowBandwidth,
    toggleLowBandwidth,
  }

  return (
    <ThemeContext.Provider value={value}>
      <div className={lowBandwidth ? 'low-bandwidth' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
