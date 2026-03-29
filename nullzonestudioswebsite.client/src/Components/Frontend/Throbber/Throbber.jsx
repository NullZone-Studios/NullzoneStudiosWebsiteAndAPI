import React from "react";
import './Throbber.css'

const Throbber = ({ logo }) => {
    return (
        <div className="throbber-container">
            <div className="throbber">
                <img src={logo} alt="" />
            </div>
        </div>
    );
}

export default Throbber;