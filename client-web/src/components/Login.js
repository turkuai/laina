import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useEffect, useState } from "react";
import '../App.css';

export default function Login() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");

    useEffect(() => {
        if (isAuthenticated) navigate("/admin", { replace: true });
    }, [isAuthenticated, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        login();
        navigate("/admin", { replace: true });
    };

    return (
        <div className="page-container">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                />
                <input
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    type="password"
                    placeholder="Password"
                />
                <button type="submit">Sign in</button>
            </form>
        </div>
    );
}
