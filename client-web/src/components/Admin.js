import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import '../App.css';

export default function Admin() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };


return (
    <div className="admin-container">
        <h1>Admin</h1>
        <p>This is the protected admin page.</p>
        <button onClick={handleLogout}>Logout</button>
    </div>
);
}
