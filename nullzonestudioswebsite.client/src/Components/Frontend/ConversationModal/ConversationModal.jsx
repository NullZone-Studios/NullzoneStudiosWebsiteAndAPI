import { useRef, useEffect, useState } from "react";
import Icon from '../Icon/Icon';
import Throbber from '../Throbber/Throbber';
import EmailEntry from "./EmailEntry";
import './ConversationModal.css';

const ConversationModal = ({ hook, supportEmail }) => {
    const {conversation, emails, loading, loadingMore, hasMore, sending, close, fetchEmailHtml, reply, loadOlder, sender} = hook;

    const [replyBody, setReplyBody] = useState('');
    const scrollRef = useRef(null);
    const prevScrollHeightRef = useRef(0);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!loading)
            bottomRef.current?.scrollIntoView();
    }, [loading]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const newScrollHeight = el.scrollHeight;
        const diff = newScrollHeight - prevScrollHeightRef.current;
        if (diff > 0) el.scrollTop += diff;
    }, [emails.length]);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        if (el.scrollTop < 50 && hasMore && !loadingMore) {
            prevScrollHeightRef.current = el.scrollHeight;
            loadOlder();
        }
    };

    const handleReply = async () => {
        if (!replyBody.trim() || !emails.length) return;
        const lastEmail = emails.at(-1);
        await reply(lastEmail.id, replyBody);
        setReplyBody('');
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey))
            handleReply();
    }

    if (!conversation) return null;

    return (
        <div className="modal-backdrop" onClick={close}>
            <div className="modal-wrapper">
            <div className="modal conversation-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="conversation-info">
                        <h3>{conversation.subject}</h3>
                        <span className="linked-customer">
                        <Icon name="person-fill" />
                        {sender?.name ?? 'Unknown'}
                        {sender?.email && <span className="linked-customer-email">{sender.email}</span>}
                    </span>
                    </div>
                    <button className="close" onClick={close}><Icon name="x-lg"/></button>
                </div>
                <div className="modal-body" ref={scrollRef} onScroll={handleScroll}>
                    {loadingMore && (
                        <div className="load-more-indicator">
                            <Throbber />
                        </div>
                    )}

                    {!hasMore && emails.length > 0 && (
                        <p className="conversation-start-label">Beginning of conversation</p>
                    )}

                    {loading
                        ? <Throbber />
                        : emails.map(email => (
                            <EmailEntry
                                key={email.id}
                                email={email}
                                onFetchHtml={fetchEmailHtml}
                                supportEmail={supportEmail}
                            />
                        ))
                    }
                    <div ref={bottomRef}></div>
                </div>
                <div className="modal-reply">
                    <textarea
                        value={replyBody}
                        onChange={e => setReplyBody(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Write a reply... (Ctrl+Enter to send)"
                        rows={3}
                        disabled={sending}
                    />
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={handleReply}
                        disabled={!replyBody.trim() || sending}
                    >
                        {sending ? <Throbber small /> : <Icon name ="send" />}
                        Send
                    </button>
                </div>
            </div>
            </div>
        </div>
    )
};

export default ConversationModal;