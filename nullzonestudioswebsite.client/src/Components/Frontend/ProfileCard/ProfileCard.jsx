import React from "react";
import {MarkdownBlock, MarkdownSpan, MarkdownElement} from "md-block";
import './ProfileCard.css'
import { rotationByMousePosition } from "../../../assets/helperFunctions";

class ProfileCard extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            flipped: false,
            rotateY: 0,
            rotateX: 0,
            scale: 1
        };
        this.ref = React.createRef();
    }

    handleFlip = () => {
        this.setState(prev => ({ 
            flipped: !prev.flipped,
            rotateY: prev.rotateY + (prev.flipped ? -180 : 180),
            scale: 1.05,
        }));
    };

    handleHover = (e) => {
        const rotation = rotationByMousePosition(e, this.ref.current, 50);
        this.setState({
            rotateX: rotation.x,
            rotateY: (this.state.flipped ? 180 : 0) + rotation.y,
            scale: 1.05,
        });
    };

    handleMouseLeave = () => {
        this.setState({
            rotateX: 0,
            rotateY: this.state.flipped ? 180 : 0,
            scale: 1
        });
    };

    handleMouseEnter = (e) => {
        const rotation = rotationByMousePosition(e, this.ref.current, 50);

        this.setState({
            rotateX: rotation.x,
            rotateY: (this.state.flipped ? 180 : 0) + rotation.y,
            scale: 1.05,
        });
    }

    render(){
        return (
            <div 
            ref={this.ref}
            className={`profile-card ${this.state.flipped ? "flipped" : ""}`} 
            onClick={this.handleFlip}
            onMouseMove={this.handleHover}
            onMouseLeave={this.handleMouseLeave}
            onMouseEnter={this.handleMouseEnter}
            style={{
                transform: `rotateX(${this.state.rotateX}deg) rotateY(${this.state.rotateY}deg) scale(${this.state.scale})`,
            }}
            >
                <div className="back">
                    <img src={this.props.img} alt="" loading="lazy" />
                    <h3 className="name">{this.props.name}<i className="bi bi-dot"></i><small>{this.props.jobTitle}</small></h3>
                    <div className="about">
                        <md-block>{this.props.about}</md-block>
                    </div>
                </div>
                <div className="front">
                    <img src={this.props.img} alt="" loading="lazy" />
                    <h3 className="name">{this.props.name}<i className="bi bi-dot"></i><small>{this.props.jobTitle}</small></h3>
                </div>
            </div>
        );
    }
}

export default ProfileCard;