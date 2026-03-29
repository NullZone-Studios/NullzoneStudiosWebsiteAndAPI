import React from "react";
import './LoadingError.css'
import ErrorImg from '../../../assets/images/error.svg'

const LoadingError = ({ error }) => {
    return (
        <div className="error-container">
            <img src={ErrorImg} alt="" />
            <h2><i className="bi bi-exclamation-triangle"></i> {error} <i className="bi bi-exclamation-triangle"></i></h2>
        </div>
    );
}

export default LoadingError;