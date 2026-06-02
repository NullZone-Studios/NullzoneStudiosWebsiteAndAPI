import React from "react";
import './NavBar.css'

class NavBar extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            activePage: "",
            tinted: false,
            open: false,
        };
        this.handleScroll = this.handleScroll.bind(this);
        this.observer = null;
    }

    componentDidMount(){
        window.addEventListener("scroll", this.handleScroll);
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.setState({ activePage: entry.target.id });
                    }
                });
            },
            {
                threshold: 0.5,
            }
        );

        const frontSection = document.getElementById("front");
        if (frontSection) this.observer.observe(frontSection);

        this.props.children.forEach(child => {
            if (!React.isValidElement(child)) return;
            if (child.props.href != undefined){
                const section = document.getElementById(child.props.href.replace("#", ""));
                if (section) this.observer.observe(section);
            }
        });
        
    }

    componentWillUnmount(){
        window.removeEventListener("scroll", this.handleScroll);
    }

    handleScroll(){
            this.setState({ tinted: (window.scrollY > 50)});
    }

    render(){
        return (
            <>
            <header className={`${this.state.tinted ? "tinted" : ""} ${this.state.open ? "open" : ""}`}>
                <div>
                    <a href="#" id="logo"><img src={this.props.logo} alt="Logo" /></a>
                </div>
                <nav>
                    <ul>
                        {
                            React.Children.map(this.props.children, child => {
                                if (!React.isValidElement(child)) return child;
                                const href = child.props.href || "";
                                const id = href.replace("#", "");

                                return React.cloneElement(child, {
                                    active: this.state.activePage == id
                                });
                            })
                        }
                    </ul>
                </nav>
            </header>
            <button className={`${"header-menu-button"} ${this.state.open ? "open" : ""}`} onClick={() => this.setState(s => ({ open: !s.open }))}>
                <svg stroke="var(--button-color)" stroke-width="10" fill="none" className="hamburger" viewBox="0 0 100 100">
                    <path class="line" stroke-linecap="round" stroke-linejoin="round" d="m 20 20 h 60 a 1 1 0 0 1 0 30 h -60 a 1 1 0 0 0 0 30 h 60 h -30 v -60"></path>
                </svg>
            </button>
            </>
        );
    }
}

export default NavBar;