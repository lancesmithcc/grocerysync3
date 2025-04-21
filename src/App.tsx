import './App.css'
import FloatingEmojis from './components/FloatingEmojis'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ListView from './pages/ListView'
import Invite from './pages/Invite'
import ListAdmin from './pages/ListAdmin'

function App() {
  return (
    <>
      <FloatingEmojis />
      <div style={{
        position: 'fixed',
        top: 20,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        overflowY: 'auto'
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '500px',
          margin: '0 auto',
          borderRadius: '33px',
          overflow: 'visible'
        }}>
          {/* Aurora Border */}
          <div style={{
            position: 'absolute',
            top: '-6px',
            left: '-6px',
            right: '-6px',
            bottom: '-6px',
            background: 'linear-gradient(135deg, #8b5cf6, #3CAAFF, #4ade80)',
            borderRadius: '33px',
            zIndex: 0
          }}></div>
          
          {/* Black Content Box */}
          <div style={{
            position: 'relative',
            backgroundColor: '#000',
            margin: '5px',
            padding: '40px',
            borderRadius: '31px',
            opacity: 0.9,
            zIndex: 1
          }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/list/:id" element={<ListView />} />
              <Route path="/invite/:code" element={<Invite />} />
              <Route path="/lists/:id/admin" element={<ListAdmin />} />
            </Routes>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
