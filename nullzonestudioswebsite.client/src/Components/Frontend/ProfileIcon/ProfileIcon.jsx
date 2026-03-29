import React from "react";
import "./ProfileIcon.css";
import ProfileStandinImg from "../../../assets/images/profile-img-standin.png";
import { MiniProfileManagerAPI } from "../../Users/MiniProfileManager";

function ProfileIcon({ src, alt, fallbackSrc = ProfileStandinImg, className = "", userId = null, isInteractive = true }) {
    const imageSource = src || fallbackSrc;
    const canInteract = isInteractive && userId !== null;
    const combinedClassName = ["profile-icon", canInteract ? "profile-icon-button" : "", className].filter(Boolean).join(" ");

    const handleClick = (event) => {
        if (canInteract) {
            MiniProfileManagerAPI.openMiniProfile(userId, event);
        }
    };

    const handleKeyDown = (event) => {
        if (!canInteract) {
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            MiniProfileManagerAPI.openMiniProfile(userId, event);
        }
    };

    return (
        <img
            className={combinedClassName}
            src={imageSource}
            alt={alt}
            onClick={canInteract ? handleClick : undefined}
            onKeyDown={canInteract ? handleKeyDown : undefined}
            role={canInteract ? "button" : undefined}
            tabIndex={canInteract ? 0 : undefined}
        />
    );
}

export default ProfileIcon;
