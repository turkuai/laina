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

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/admin", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const result = login(username, password);
        
        if (result.success) {
            setError("");
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
                        />
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
                        Admin: admin / admin123
                    </p>
                    <p className="login-demo-text">
                        User: user1 / pass123
                    </p>
                </div>
            </div>
        </div>
    );
}