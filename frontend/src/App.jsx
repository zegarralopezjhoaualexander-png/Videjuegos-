import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import Login from './page/Login.jsx'
import Registro from './page/Registro.jsx'
import Catalogo from './page/Catalogo.jsx'
import JuegoDetalle from './page/JuegoDetalle.jsx'
import Admin from './page/Admin.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/juego/:id" element={<JuegoDetalle />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
