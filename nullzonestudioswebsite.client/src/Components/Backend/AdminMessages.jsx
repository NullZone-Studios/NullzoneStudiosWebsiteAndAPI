import { Fragment } from 'react';
import useConversations from '../../hooks/useConversations';
import Throbber from '../Frontend/Throbber/Throbber';
import LoadingError from '../Frontend/LoadingError/LoadingError';

function AdminMessages() {
    const { conversations, loading, error, page, setPage, pageSize, setPageSize } = useConversations();

    return (
        <section className="admin-section" id="admin-messages">
            <div className="admin-section-header">
                <h2>Contact Messages</h2>
            </div>
            <div className="admin-section-body">
                {conversations.total === 0
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
                                {conversations.conversations && conversations.conversations.map(conversation => (
                                    <Fragment key={conversation.id}>
                                        <tr>
                                            <td></td>
                                            <td>{conversation.lastMessage.from}</td>
                                            <td>{conversation.subject}</td>
                                            <td>{conversation.lastMessageDate}</td>
                                            <td></td>
                                        </tr>
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
