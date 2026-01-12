import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useEffect, useState } from "react";
import '../App.css';
import './Login.css';

export default function Login() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Remember me state
    const [rememberMe, setRememberMe] = useState(false);

    // ⬇️ NEW: on first render, load remembered credentials (if any)
    useEffect(() => {
        const saved = localStorage.getItem("remembered_credentials");
        if (saved) {
            try {
                const { username, password } = JSON.parse(saved);
                setUsername(username || "");
                setPassword(password || "");
                setRememberMe(true);
            } catch {
                localStorage.removeItem("remembered_credentials");
            }
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/admin", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // pass rememberMe flag to AuthContext (as we did before)
        const result = login(username, password, rememberMe);
        
        if (result.success) {
            setError("");

            // ⬇️ NEW: store or clear credentials based on checkbox
            if (rememberMe) {
                localStorage.setItem(
                    "remembered_credentials",
                    JSON.stringify({ username, password })
                );
            } else {
                localStorage.removeItem("remembered_credentials");
            }

            navigate("/admin", { replace: true });
        } else {
            setError(result.error);
        }                                                                                                                  
    };
                                             
    return (
        <div className="page-container login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">
                        Borrowing System
                    </h1>
                    <p className="login-subtitle">Please login to continue</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="login-form-group">
                        <label className="login-label">
                            Username
                        </label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            className="login-input"
                            name="username"
                            autoComplete="username"
                        />
                    </div>

                    <div className="login-form-group">
                        <label className="login-label">
                            Password
                        </label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Password"
                            required
                            className="login-input"
                            name="password"
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Remember me checkbox */}
                    <div className="login-form-group">
                        <label
                            className="login-label"
                            style={{ display: "flex", alignItems: "center", gap: "8px" }}
                        >
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            Remember me
                        </label>
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="login-submit-btn"
                    >
                        Sign in
                    </button>
                </form>

                <div className="login-demo-credentials">
                    <p className="login-demo-title">
                        Demo Credentials:
                    </p>
                    <p className="login-demo-text">
                        <strong>Admin:</strong> admin / admin123
                    </p>
                    <p className="login-demo-text">
                        <strong>Student:</strong> mikko / pass123
                    </p>
                    <p className="login-demo-text">
                        <strong>Student:</strong> ville / pass123
                    </p>
                    <p className="login-demo-text">
                        <strong>Student:</strong> aino / pass123
                    </p>
                </div>
            </div>
        </div>
    ); 
}
