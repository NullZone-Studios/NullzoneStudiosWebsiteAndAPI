import React from "react";
import { rotationByMousePosition } from "../../../assets/helperFunctions";
import './BigLogo.css'

class BigLogo extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            rotationY: 0,
            rotationX: 0,
        };
        this.wrapperRef = React.createRef();
    }

    handleMouseMove = (e) => {
        const rotation = rotationByMousePosition(e, this.wrapperRef.current, 100);

        this.setState({
            rotationY: rotation.y,
            rotationX: rotation.x,
        });
    };

    handleMouseLeave = () => {
        this.setState({
            rotationX: 0,
            rotationY: 0
        });
    };

    render(){
        return (
            <div
                className="bigLogoWrapper"
                ref={this.wrapperRef}
                onMouseMove={this.handleMouseMove}
                onMouseLeave={this.handleMouseLeave}
                style={{
                    perspective: "800px",
                    display: "inline-block",
                    width: "100%",
                }}
            >
                <img
                    src={this.props.logo} 
                    alt="Big Logo"
                    style={{
                        transform: `rotateX(${this.state.rotationX}deg) rotateY(${this.state.rotationY}deg)`,
                        transformStyle: "preserve-3d",
                        transition: "all .1s ease-out",
                        width: "100%",
                    }} 
                />
            </div>
        );
    }
}

export default BigLogo;