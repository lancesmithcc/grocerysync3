import './App.css'
import FloatingEmojis from './components/FloatingEmojis'
import Header from './components/Header'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ListView from './pages/ListView'
import Invite from './pages/Invite'

function App() {
  return (
    <>
      <FloatingEmojis />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/list/:id" element={<ListView />} />
        <Route path="/invite/:code" element={<Invite />} />
      </Routes>
    </>
  )
}

export default App
