import React from "react";
import "./Footer.css";

class Footer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showBackToTop: false,
        };
        this.handleScroll = this.handleScroll.bind(this);
        this.handleBackToTop = this.handleBackToTop.bind(this);
        this.sectionIds = (props.sections && props.sections.length > 0)
            ? props.sections
            : ["about-us", "projects", "blog", "contact-us"];
    }

    componentDidMount() {
        window.addEventListener("scroll", this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.handleScroll);
    }

    handleScroll() {
        this.setState({ showBackToTop: window.scrollY > 300 });
    }

    handleBackToTop() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    render() {
        const year = new Date().getFullYear();
        const brand = this.props.brand || "NullZone Studios";
        const tagline = this.props.tagline || "From the null, we dream.";

        return (
            <footer className="footer">
                <div className="footer-inner">
                    <div className="footer-brand">
                        <div className="footer-logo">{brand}</div>
                        <p className="footer-tagline">{tagline}</p>
                    </div>

                    <nav className="footer-nav">
                        <h4>Explore</h4>
                        <ul>
                            {this.sectionIds.map((id) => {
                                const label = id.replace("-", " ");
                                return (
                                    <li key={id}>
                                        <a href={`#${id}`}>{label}</a>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <nav className="footer-socials">
                        <h4>Socials</h4>
                        <ul>
                            <li>
                                <a href="https://www.linkedin.com/company/nullzone-studios"><i className="bi bi-linkedin"></i> LinkedIn</a>
                            </li>
                            <li>
                                <a href="https://www.facebook.com/profile.php?id=61579509230602"><i className="bi bi-facebook"></i> Facebook</a>
                            </li>
                            <li>
                                <a href="https://nullzone-studios.itch.io"><i className="bi bi-controller"></i> Itch.IO</a>
                            </li>
                            <li>
                                <a href="https://x.com/NullZoneStudios"><i className="bi bi-twitter-x"></i> X</a>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="footer-bottom">
                    <p>© {year} {brand}. All rights reserved.</p>
                </div>

                <button
                    className={`back-to-top ${this.state.showBackToTop ? "show" : ""}`}
                    type="button"
                    onClick={this.handleBackToTop}
                    aria-label="Back to top"
                >
                    ↑ Top
                </button>
            </footer>
        );
    }
}

export default Footer;