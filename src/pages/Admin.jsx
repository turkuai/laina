import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Admin() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true }); // replace=history-safe
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Admin</h1>
      <p>Empty admin page (protected). Add your content here.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
