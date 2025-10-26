import React from 'react'
import Hero from './components/Hero'
import BackgroundEffects from './components/BackgroundEffects'
import Generator from './components/Generator'
import About from './components/About'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen w-full bg-[#0b0a12] text-white font-sans">
      <BackgroundEffects />
      <Hero />
      <Generator />
      <About />
      <Footer />
    </div>
  )
}

export default App
