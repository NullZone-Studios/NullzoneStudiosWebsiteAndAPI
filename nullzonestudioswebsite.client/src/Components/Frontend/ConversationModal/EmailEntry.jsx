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
            <div className={`email-bubble ${expanded ? "expanded" : ""}`}>
                <div className="email-bubble-preview">
                    {expanded
                        ? html
                            ? <iframe srcDoc={html} className="email-bubble-iframe" sandbox="allow-same-origin" />
                            : <pre>{email.textBody}</pre>
                        : <pre>{(() => {
                            const text = (email.textBody ?? '(no preview)')
                                // eslint-disable-next-line no-misleading-character-class
                                .replace(/[\u00AD\u034F\u200B-\u200D\uFEFF\u00A0]+/g, " ")
                                .replace(/[\r\n]+/gm, " ")
                                .replace(/\s+/g, " ")
                                .trim();
                            return text.length > 200 ? text.substring(0, 200) + "..." : text;
                        })()}</pre>
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