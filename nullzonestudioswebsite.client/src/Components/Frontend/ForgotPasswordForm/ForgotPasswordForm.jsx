import { useState } from "react";
import './ForgotPasswordForm.css'
import client from "../../../api/client";

function ForgotPasswordForm({ isOpen, onClose }) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const response = await client.post('/api/auth/forgot-password', { email: email.trim().toLocaleLowerCase() });
            if (!response.ok) {
                let message = 'Failed to send reset email.';
                try {
                    const error = await response.json();
                    message = error.message ?? message;
                } catch {/* Empty */ }
                throw new Error(message);
            }
            setSubmitted(true);
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
            {isOpen && <div className="forgot-password-overlay" onClick={onClose}></div>}
            <aside className={`forgot-password-panel ${isOpen ? "open" : ""}`}>
                <div className="forgot-password-container">
                    <button className="close-btn" onClick={onClose}>&times;</button>
                    <h2>Forgot Password</h2>
                    {submitted ? (
                        <p>If an account exists with that email, a reset link has been sent.</p>
                    ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                                {error && <p className="forgot-password-error">{error}</p>}
                        <button type="submit" className="forgot-password-btn">
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                        </form>
                    )}   
                </div>
            </aside>
        </>
    );

}

export default ForgotPasswordForm;