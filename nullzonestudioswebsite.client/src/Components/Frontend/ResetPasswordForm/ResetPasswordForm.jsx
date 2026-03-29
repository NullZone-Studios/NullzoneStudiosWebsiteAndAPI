import { useState } from "react";
import client from "../../../api/client";
import './ResetPasswordForm.css'
import Icon from "../Icon/Icon";

const ResetPasswordForm = ({ isOpen, onClose, token }) => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setComfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const response = await client.post('/api/auth/reset-password', {
                token,
                newPassword: password
            });
            if (!response.ok) {
                let message = "Failed to reset password.";
                try {
                    const error = await response.json();
                    message = error.message ?? message;
                } catch {/* Empty */ }
                throw new Error(message);
            }
            setSuccess(true);
        } catch (err) {
            if (err instanceof TypeError)
                setError('Unable to reach the server. Please try again later.');
            else
                setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {isOpen && <div className="reset-password-overlay" onClick={onClose} onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}></div>}
            <aside className={`reset-password-panel ${isOpen ? "open" : ""}`} onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
                <div className="reset-password-container">
                    <div className="header">
                        <h2>Reset Password</h2>
                        <button className="close-btn" onClick={onClose}><Icon name="x" /></button>
                    </div>
                    <hr />
                    {success ? (
                        <p>Password reset successful. You can now log in with your new password.</p>
                    ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="password">New Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                        minLength={8}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setComfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                        minLength={8}
                                    />
                                </div>
                                {error && <p className="reset-password-error">{error}</p>}
                                <button type="submit" className="login-btn" disabled={loading}>
                                    {loading ? "Resetting..." : "Reset Password"}
                                </button>
                            </form>
                    )}
                </div>
            </aside>
        </>
    )
};

export default ResetPasswordForm;