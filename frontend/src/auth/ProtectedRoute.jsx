import { Navigate, Outlet, useLocation } from "react-router-dom";
import { esRutaInterna } from "../utils/routing.js";
import { useAuth } from "./useAuth.js";

function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();
  const desde = `${location.pathname}${location.search}`;
  const retorno = esRutaInterna(desde) ? desde : "/catalogo";

  if (!user?.token) {
    return <Navigate to="/login" replace state={{ from: retorno }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
