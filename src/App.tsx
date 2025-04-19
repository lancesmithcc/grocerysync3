import './App.css'
import FloatingEmojis from './components/FloatingEmojis'
import AuroraBox from './components/AuroraBox'
import Header from './components/Header'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ListView from './pages/ListView'
import Invite from './pages/Invite'

function App() {
  return (
    <>
      <FloatingEmojis />
      <div className="relative z-10 flex justify-center items-start min-h-screen p-4">
        <AuroraBox className="w-full max-w-4xl p-6">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/list/:id" element={<ListView />} />
            <Route path="/invite/:code" element={<Invite />} />
          </Routes>
        </AuroraBox>
      </div>
    </>
  )
}

export default App
