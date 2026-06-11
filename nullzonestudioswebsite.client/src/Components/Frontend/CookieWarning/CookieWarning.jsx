import React, { useState, useEffect } from "react";
import "./CookieWarning.css";

export default function CookiePopup() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem("cookieConsent");
    if (!hasSeen) {
      setTimeout(() => setVisible(true), 1);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setVisible(false);
  };

  const toggleDetails = () => {
    setExpanded((prev) => !prev);
  };

  if (!visible) return null;

    return (
    <div className="cookie-warning" style={style}>
      <div className="cookie-popup">
        <p className="cookie-text">
          This website uses cookies to improve your experience. By clicking OK,
          you agree to our use of cookies.
        </p>
        <div className="cookie-buttons">
          <button className="cookie-details" onClick={toggleDetails}>
            {expanded ? "Hide details" : "Details"}
          </button>
          <button className="cookie-accept" onClick={handleAccept}>
            OK
          </button>
        </div>
        {expanded && (
          <div className="cookie-details-content">
            <p>
              The following data may be saved and stored locally on your device:
              <ul>
                <li>- Temporary login tokens</li>
                <li>- Images</li>
              </ul>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const style = {
    position: "fixed",
    bottom: "2em",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
}