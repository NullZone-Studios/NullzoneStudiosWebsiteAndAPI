import React from "react";
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
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    handleSubmit(e) {
        e.preventDefault();
        this.setState({ submitted: true });
    }

    render() {
        const { submitted } = this.state;

        return (
            <div className="contact-form-wrapper">
                <div className="contact-form-accent" />
                <h2 className="contact-form-title">Contact Us</h2>
                <p className="contact-form-subtitle">
                    Have a question, idea, or want to work with us? Drop us a message.
                </p>

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

                        <button className="contact-form-submit" type="submit">
                            Send Message
                        </button>
                    </form>
                )}
            </div>
        );
    }
}

export default ContactForm;
