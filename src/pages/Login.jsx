import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: validate real credentials; here we just "log in"
    login();
    navigate("/admin", { replace: true }); // replace prevents going "back" to login
  };

  // If already logged in, go admin
  if (isAuthenticated) {
    navigate("/admin", { replace: true });
    return null;
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          type="password"
        />
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}
