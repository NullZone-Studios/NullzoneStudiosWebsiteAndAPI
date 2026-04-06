import { useState } from "react";
import Icon from "../Icon/Icon";
import Throbber from "../Throbber/Throbber";

const EmailEntry = ({email, onFetchHtml, supportEmail}) => {
    const [html, setHtml] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const isSent = email.from?.toLowerCase() === supportEmail?.toLowerCase();

    const handleExpand = async () => {
        if (!expanded && !html){
            const content = await onFetchHtml(email.id);
            setHtml(content);
        }
        setExpanded(e => !e);
    };

    return (
        <div className={`email-bubble-wrapper ${isSent ? 'sent' : 'recieved'}`}>
            <div className="email-bubble">
                <div className="email-bubble-preview">
                    {expanded
                        ? html
                            ? <iframe srcDoc={html} className="email-bubble-iframe" sandbox="allow-same-origin" />
                            : <pre>{email.textBody}</pre>
                        : <pre>{email.textBody ?? '(no preview)'}</pre>
                    }
                </div>
                <div className="email-bubble-info">
                    <span className="email-bubble-date">{email.date}</span>
                    <button onClick={handleExpand}>{expanded ? "close" : "expand"}</button>
                </div>
            </div>
        </div>
    );
};

export default EmailEntry;