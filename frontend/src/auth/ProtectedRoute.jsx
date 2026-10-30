import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth.js";

function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user?.token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
