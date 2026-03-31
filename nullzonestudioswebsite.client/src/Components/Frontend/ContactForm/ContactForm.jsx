import React from "react";
import client from "../../../api/client";
import "./ContactForm.css";

class ContactForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            email: "",
            subject: "",
            message: "",
            submitted: false,
            loading: false,
            error: null,
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        this.setState({ error: null, loading: true });
        try {
            const response = await client.post('/api/auth/contactForm', { email: this.state.email, name: this.state.name, subject: this.state.subject, message: this.state.message });
            if (!response.ok) {
                let message = 'Failed to send contact email.';
                try {
                    const error = await response.json();
                    message = error.message ?? message;
                } catch {/* Empty */ }
                throw new Error(message);
            }
            this.setState({ submitted: true });
        } catch (err) {
            if (err instanceof TypeError)
                this.setState({ error: 'Unable to reach the server. Please try again later.' });
            else
                this.setState({ error: err.message });
        } finally {
            this.setState({ loading: false });
        }
    };

    render() {
        const { submitted, loading, error } = this.state;

        return (
            <div className="contact-form-wrapper">
                <div className="contact-form-accent" />
                <h2 className="contact-form-title">Contact Us</h2>
                <p className="contact-form-subtitle">
                    Have a question, idea, or want to work with us? Drop us a message.
                </p>

                {error && <div className="contact-form-error">{error}</div>}
                {loading && <div className="contact-form-loading">Sending message, please wait...</div>}

                {submitted ? (
                    <div className="contact-form-success">
                        <span className="contact-form-success-icon">&#10003;</span>
                        <p>Thanks for reaching out! We&apos;ll get back to you soon.</p>
                    </div>
                ) : (
                    <form className="contact-form" onSubmit={this.handleSubmit} noValidate>
                        <div className="contact-form-row">
                            <div className="contact-form-group">
                                <label htmlFor="cf-name">Name</label>
                                <input
                                    id="cf-name"
                                    type="text"
                                    name="name"
                                    placeholder="Your name"
                                    value={this.state.name}
                                    onChange={this.handleChange}
                                    required
                                    autoComplete="name"
                                />
                            </div>
                            <div className="contact-form-group">
                                <label htmlFor="cf-email">Email</label>
                                <input
                                    id="cf-email"
                                    type="email"
                                    name="email"
                                    placeholder="your@email.com"
                                    value={this.state.email}
                                    onChange={this.handleChange}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="contact-form-group">
                            <label htmlFor="cf-subject">Subject</label>
                            <input
                                id="cf-subject"
                                type="text"
                                name="subject"
                                placeholder="What is this about?"
                                value={this.state.subject}
                                onChange={this.handleChange}
                                autoComplete="off"
                            />
                        </div>

                        <div className="contact-form-group">
                            <label htmlFor="cf-message">Message</label>
                            <textarea
                                id="cf-message"
                                name="message"
                                placeholder="Tell us more..."
                                rows={6}
                                value={this.state.message}
                                onChange={this.handleChange}
                                required
                            />
                        </div>

                        <button className="contact-form-submit" type="submit" onClick={this.handleSubmit} disabled={loading}>
                            Send Message
                        </button>
                    </form>
                )}
            </div>
        );
    }
}

export default ContactForm;
