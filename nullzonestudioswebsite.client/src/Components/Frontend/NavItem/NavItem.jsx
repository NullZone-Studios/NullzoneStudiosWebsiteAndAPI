import React from "react";

function NavItem({href, icon, children, active, onClick, disableHoverEffect}) {
    const handleClick = (e) => {
        if (onClick) {
            e.preventDefault();
            onClick();
        }
    };
    return (
        <a className={`${active ? "active" : ""} ${disableHoverEffect ? "disable-hover" : ""}`} href={href || "#"} onClick={handleClick}>
            <li><i className={`bi bi-${icon}`}></i> {children}</li>
        </a>
    );
}

export default NavItem;