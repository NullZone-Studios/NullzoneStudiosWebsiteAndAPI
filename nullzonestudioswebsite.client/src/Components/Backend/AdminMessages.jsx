import { Fragment, useEffect, useState } from 'react';
import useConversations from '../../hooks/useConversations';
import Throbber from '../Frontend/Throbber/Throbber';
import LoadingError from '../Frontend/LoadingError/LoadingError';
import Icon from '../Frontend/Icon/Icon';
import './AdminMessages.css';

function AdminMessages() {
    const { nextPage, prevPage, total, pageSize, page, setPage, refresh, loading, deleteConversation, conversations, conversation, fetch, unreads } = useConversations();
    const totalPages = Math.ceil(total / pageSize);

    const getPageWindow = () => {
        const window = 2;
        let start = Math.max(0, page - window);
        let end = Math.min(totalPages - 1, page + window);

        if (page - window < 0) end = Math.min(totalPages - 1, end + (window - page));
        if (page + window > totalPages - 1) start = Math.max(0, start - (page + window - totalPages));

        return Array.from({ length: end-start + 1}, (_,i) => start + i);
    };

    return (
        <section className="admin-section" id="admin-messages">
            <div className="admin-section-header">
                <h2>Support Conversations</h2>
                <div className="flx-row gp-1">
                    { unreads > 0 && <div className='admin-badge'>{unreads} unread messages</div> }
                    <button onClick={refresh} className={`conversations-refresh-button ${loading ? "loading" : ""}`}><Icon name="arrow-counterclockwise" /></button>
                </div>
            </div>
            <div className="admin-section-body">
                {conversations.total === 0
                    ? <p style={{ opacity: 0.45 }}>No messages yet.</p>
                    : (
                        <>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>From</th>
                                    <th>Subject</th>
                                    <th>Last Message</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conversations && conversations.map(conversation => (
                                    <Fragment key={conversation.id}>
                                        <tr>
                                            <td>
                                                <div className={`message-badge ${conversation.unreadCount > 0 ? "unread" : ""}`}>{conversation.unreadCount}</div>
                                            </td>
                                            <td>{conversation.lastMessage.from}</td>
                                            <td>{conversation.subject}</td>
                                            <td>{conversation.lastMessageDate}</td>
                                            <td>
                                                <div className="actions">
                                                    <button className='admin-btn admin-btn-ghost' onClick={() => fetch(conversation.id)}>Open Conversation</button>
                                                    <button className='admin-btn admin-btn-ghost'>Mark as read</button>
                                                    <button className='admin-btn admin-btn-danger' onClick={() => deleteConversation(conversation.id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                        {totalPages > 1 && (
                            <div className='admin-page-buttons'>
                                <button onClick={prevPage} disabled={page === 0}><Icon name="chevron-left" ></Icon></button>
                                
                                {getPageWindow()[0] > 0 && (
                                    <>
                                        <button onClick={() => setPage(0)} className={page === 0 ? 'active' : ''}>1</button>
                                        {getPageWindow()[0] > 1 && <span className='page-ellipsis'>...</span>}
                                    </>
                                )}

                                {getPageWindow().map(i => (
                                    <button key={i} onClick={() => setPage(i)} className={page === i ? 'active' : ''}>
                                        {i + 1}
                                    </button>
                                ))}

                                {getPageWindow().at(-1) < totalPages - 1 && (
                                    <>
                                        {getPageWindow().at(-1) < totalPages - 2 && <span className='page-ellipsis'>...</span>}
                                        <button onClick={() => setPage(totalPages - 1)} className={page === totalPages - 1 ? 'active' : ''}>
                                            {totalPages}
                                        </button>
                                    </>
                                )}

                                <button onClick={nextPage} disabled={page === totalPages - 1}><Icon name="chevron-right" ></Icon></button>
                            </div>
                        )}
                        </>
                    )
                }
            </div>
        </section>
    );
}

export default AdminMessages;
