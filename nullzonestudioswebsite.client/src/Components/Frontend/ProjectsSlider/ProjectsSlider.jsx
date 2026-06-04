import React from "react";
import './ProjectsSlider.css'

class ProjectSlider extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            count: React.Children.count(props.children),
            currentIndex: Math.floor(React.Children.count(props.children) / 2),
            hoveredIndex: null,
        }
    }

    prev = (e) => {
        e.preventDefault();
        if (this._navigating) return;
        this._navigating = true;
        setTimeout(() => {this._navigating = false;}, 300);
        const { currentIndex } = this.state;
        const count = React.Children.count(this.props.children);
        this.setState({ currentIndex: (currentIndex - 1 + count) % count});
    }
    
    next = (e) => {
        e.preventDefault();
        if (this._navigating) return;
        this._navigating = true;
        setTimeout(() => {this._navigating = false;}, 300);
        const { currentIndex } = this.state;
        const count = React.Children.count(this.props.children);
        this.setState({ currentIndex: (currentIndex + 1) % count});
    }

    getCardStyle(offset, hovered) {
        const absOffset = Math.abs(offset);

        if (offset === 0){
            return {
                transform: `translate(-50%, -50%) scale(${hovered ? 1.05: 1})`,
                zIndex: 1,
                opacity: 1,
            }
        }

        return {
            transform: `translate(${-50 + 40*offset}%, -50%) scale(${(hovered ? 1.05 : 1)-0.2*absOffset}) rotateY(${offset > 0 ? -20 : 20}deg)`,
            zIndex: -absOffset,
            opacity: absOffset > 2 ? 0 : 1,

        }
    }
    
    render(){
        const children = React.Children.toArray(this.props.children);

        return (
            <div className="project-slider">
                {
                    children.map((child, i) => {
                        const offset = i - this.state.currentIndex;

                        return React.cloneElement(child, {
                            key: i,
                            style: this.getCardStyle(offset, this.state.hoveredIndex === i),
                            onMouseMove: () => {
                                if (window.matchMedia('(pointer: coarse)').matches) return;
                                this.setState({ hoveredIndex: i });
                            },
                            onMouseLeave: () => this.setState({ hoveredIndex: null })
                        });
                    })
                }
                <div className="project-slider__controls">
                    <button onClick={this.prev} className="previous"><i className="bi bi-chevron-left"></i></button>
                    <button onClick={this.prev} className="left"><i className="bi bi-chevron-left"></i></button>
                    <button onClick={this.next} className="right"><i className="bi bi-chevron-right"></i></button>
                    <button onClick={this.next} className="next"><i className="bi bi-chevron-right"></i></button>

                </div>
            </div>
        );
    }
}

export default ProjectSlider;