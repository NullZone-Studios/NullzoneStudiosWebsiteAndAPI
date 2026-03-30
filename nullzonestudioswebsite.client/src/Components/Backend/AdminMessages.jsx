import { useState, Fragment } from 'react';

const sampleMessages = [
    { id: 1, name: 'John Doe',   email: 'john@example.com', subject: 'Collaboration inquiry', message: 'Hi, I would love to collaborate on a project with you!', receivedAt: '2026-03-26T10:00:00', read: false },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', subject: 'Game feedback',          message: 'Loved the latest game, keep it up!',                      receivedAt: '2026-03-25T14:30:00', read: true  },
];

const fmt = str => {
    const d = new Date(str);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};

function AdminMessages() {
    const [messages,  setMessages]  = useState(sampleMessages);
    const [expanded,  setExpanded]  = useState(null);

    const toggleRead  = id => setMessages(messages.map(m => m.id === id ? { ...m, read: !m.read } : m));
    const deleteMsg   = id => { setMessages(messages.filter(m => m.id !== id)); if (expanded === id) setExpanded(null); };
    const toggleExpand = id => setExpanded(expanded === id ? null : id);

    const unread = messages.filter(m => !m.read).length;

    return (
        <section className="admin-section" id="admin-messages">
            <div className="admin-section-header">
                <h2>Contact Messages</h2>
                {unread > 0 && <span className="admin-badge">{unread} unread</span>}
            </div>
            <div className="admin-section-body">
                {messages.length === 0
                    ? <p style={{ opacity: 0.45 }}>No messages yet.</p>
                    : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>From</th>
                                    <th>Subject</th>
                                    <th>Received</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.map(msg => (
                                    <Fragment key={msg.id}>
                                        <tr className={msg.read ? 'admin-row-read' : ''}>
                                            <td>
                                                <span className={`admin-unread-dot ${msg.read ? 'read' : ''}`} title={msg.read ? 'Read' : 'Unread'} />
                                            </td>
                                            <td>
                                                <strong>{msg.name}</strong><br />
                                                <small style={{ opacity: 0.55 }}>{msg.email}</small>
                                            </td>
                                            <td>
                                                <button className="admin-btn-link" onClick={() => toggleExpand(msg.id)}>
                                                    {msg.subject || <em style={{ opacity: 0.4 }}>No subject</em>}
                                                </button>
                                            </td>
                                            <td>{fmt(msg.receivedAt)}</td>
                                            <td>
                                                <div className="actions">
                                                    <button className="admin-btn admin-btn-ghost" onClick={() => toggleRead(msg.id)}>
                                                        {msg.read ? 'Mark Unread' : 'Mark Read'}
                                                    </button>
                                                    <button className="admin-btn admin-btn-danger" onClick={() => deleteMsg(msg.id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expanded === msg.id && (
                                            <tr>
                                                <td colSpan={5}>
                                                    <div className="admin-message-body">{msg.message}</div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    )
                }
            </div>
        </section>
    );
}

export default AdminMessages;
