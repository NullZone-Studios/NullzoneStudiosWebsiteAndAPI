import React from "react";
import './ProjectCard.css'

class ProjectCard extends React.Component {
    constructor(props){
        super(props);
        this.cardRef = React.createRef();
    }

    render(){
        return (
            <div ref={this.cardRef} className="project-card" style={this.props.style} onMouseMove={this.props.onMouseMove} onMouseLeave={this.props.onMouseLeave}>
                  <div className="project-content">
                      <div className="banner">
                          <img src={this.props.bannerImg} alt="" loading="lazy" />
                      </div>
                      <div className="info">
                          <h1>{this.props.title}</h1>
                          <p>{this.props.content}</p>
                          <div className="call-to-action">
                            { this.props.href && (
                            <a href={this.props.href}>
                              <button>See more</button>
                            </a>
                            )}
                          </div>
                      </div>
                  </div>
              </div>
        );
    }
}

export default ProjectCard;