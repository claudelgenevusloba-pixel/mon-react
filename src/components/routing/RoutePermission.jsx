import { Navigate } from "react-router-dom";
import { aPermission } from "../../config/access";
import AccessDenied from "./AccessDenied";

export default function RoutePermission({ utilisateur, permission, children }) {
  if (!utilisateur) {
    return <Navigate to="/login" replace />;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  const autorise = permissions.some((droit) =>
    droit ? aPermission(utilisateur, droit) : true
  );

  if (permissions.some(Boolean) && !autorise) {
    return <AccessDenied />;
  }

  return children;
}
