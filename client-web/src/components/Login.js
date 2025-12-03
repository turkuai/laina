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
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);

    // Load remembered credentials on mount
    useEffect(() => {
        const savedCredentials = localStorage.getItem("remembered_credentials");
        if (savedCredentials) {
            try {
                const { username, password } = JSON.parse(savedCredentials);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await login(username, password);

            if (result.success) {
                // Store or clear credentials based on checkbox
                if (rememberMe) {
                    localStorage.setItem(
                        "remembered_credentials",
                        JSON.stringify({ username, password })
                    );
                } else {
                    localStorage.removeItem("remembered_credentials");
                }
            } else {
                setError(result.error);
            }
            // Navigation happens automatically via useEffect above
        } catch (err) {
            console.error("Login error:", err);
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
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

                <form onSubmit={handleSubmit} autoComplete="on">
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
                            disabled={loading}
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
                            disabled={loading}
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
                                disabled={loading}
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
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <div className="login-demo-credentials">
                    <p className="login-demo-title">
                        Use credentials from your database
                    </p>
                    <p className="login-demo-text">
                        Login with any username/password from the users table
                    </p>
                </div>
            </div>
        </div>
    );
};
