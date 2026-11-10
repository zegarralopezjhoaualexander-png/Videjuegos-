import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import Login from "./pages/auth/Login.jsx";
import Registro from "./pages/auth/Registro.jsx";
import Catalogo from "./pages/catalogo/Catalogo.jsx";
import JuegoDetalle from "./pages/catalogo/JuegoDetalle.jsx";
import Admin from "./pages/admin/Admin.jsx";
import Inicio from "./pages/inicio/Inicio.jsx";
import Carrito from "./pages/carrito/Carrito.jsx";
import Checkout from "./pages/pago/Checkout.jsx";
import PagoExitoso from "./pages/pago/PagoExitoso.jsx";
import PagoError from "./pages/pago/PagoError.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/juego/:id" element={<JuegoDetalle />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/pago-exitoso" element={<PagoExitoso />} />
        <Route path="/pago-error" element={<PagoError />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
