import './App.css'
import FloatingEmojis from './components/FloatingEmojis'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ListView from './pages/ListView'
import Invite from './pages/Invite'

function App() {
  return (
    <>
      <FloatingEmojis />
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '500px',
          borderRadius: '33px',
          overflow: 'hidden'
        }}>
          {/* Aurora Border */}
          <div style={{
            position: 'absolute',
            top: '-4px',
            left: '-4px',
            right: '-4px',
            bottom: '-4px',
            background: 'linear-gradient(135deg, #8b5cf6, #3CAAFF, #4ade80)',
            borderRadius: '33px',
            zIndex: 0
          }}></div>
          
          {/* Black Content Box */}
          <div style={{
            position: 'relative',
            backgroundColor: '#000',
            margin: '2px',
            padding: '40px',
            borderRadius: '31px',
            zIndex: 1
          }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/list/:id" element={<ListView />} />
              <Route path="/invite/:code" element={<Invite />} />
            </Routes>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
