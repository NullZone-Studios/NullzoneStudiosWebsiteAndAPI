import React, { useState } from "react";
import useAuth from '../../../hooks/useAuth'
import './LogInForm.css';

function LogInForm({ isOpen, onClose, onSignUpClick, onForgotPasswordClick }) {
    const { login } = useAuth();
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(emailOrUsername, password);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }

        setEmailOrUsername("");
        setPassword("");
    };

    return (
        <>
            {isOpen && <div className="login-overlay" onClick={onClose}></div>}
            <aside className={`login-panel ${isOpen ? "open" : ""}`}>
                <div className="login-container">
                    <button className="close-btn" onClick={onClose}>&times;</button>
                    
                    <h2>Login</h2>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email or Username</label>
                            <input
                                type="text"
                                id="emailOrUsername"
                                value={emailOrUsername}
                                onChange={(e) => setEmailOrUsername(e.target.value)}
                                placeholder="Enter your email or username"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {error && <p className="login-error">{error}</p>}

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <div className="form-footer">
                        <a href="#" onClick={(e) => { e.preventDefault(); if (onForgotPasswordClick) onForgotPasswordClick(); }}>Forgot password?</a>
                        <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); if (onSignUpClick) onSignUpClick(); }}>Sign up</a></p>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default LogInForm;
