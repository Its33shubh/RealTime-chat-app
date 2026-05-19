import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom'
import Chat from './pages/chat'
import Register from './pages/Register'
import Login from './pages/login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route  path='/' element={<Navigate to="/login"/>}/> */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

