import React from 'react'
import Hero from './components/Hero'
import BackgroundEffects from './components/BackgroundEffects'
import Generator from './components/Generator'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen w-full bg-[#0b0a12] text-white font-sans">
      <BackgroundEffects />
      <Hero />
      <Generator />
      <Footer />
    </div>
  )
}

export default App
