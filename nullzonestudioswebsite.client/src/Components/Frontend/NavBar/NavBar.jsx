import React from "react";
import './NavBar.css'

class NavBar extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            activePage: "",
            tinted: false,
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
            <header className={`${this.state.tinted ? "tinted" : ""}`}>
                <div>
                    <a href="#" id="logo" onClick={(e) => {
                        e.preventDefault();
                        console.log("Logo clicked, onLogoClick exists:", !!this.props.onLogoClick);
                        if (this.props.onLogoClick) {
                            this.props.onLogoClick();
                        }
                    }}><img src={this.props.logo} alt="Logo" /></a>
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
        );
    }
}

export default NavBar;