import { Navigate } from 'react-router-dom';

// Redirect to unified Candidati page with filter
export default function Risultati() {
  return <Navigate to="/candidati" replace />;
}