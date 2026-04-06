import { useState, useEffect, useCallback } from "react";
import client from "../api/client";
import { clamp } from "../assets/helperFunctions";
import { showToast } from "../Components/toast";

const useConversations = () => {
    const [conversations, setConversations] = useState([]);
    const [total, setTotal] = useState(0);
    const [unreads, setUnreads] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingError, setLoadingError] = useState(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const fetchConversations = useCallback(async () => {
            setLoading(true);
            setLoadingError(null);
            try {
                const response = await client.get(`api/admin/email/conversations?page=${page}&pageSize=${pageSize}`);
                if (!response.ok){
                    let message = 'Failed to fetch conversations.';
                    try {
                        const error = await response.json();
                        message = error.message ?? message;
                    } catch { /* Empty */ }
                    throw new Error(message);
                }
                try {
                    const data = await response.json();
                    console.log(data);
                    setConversations(data.conversations);
                    setTotal(data.total);
                    setUnreads(data.totalUnread)
                } catch {
                    throw new Error('Invalid response from server.');
                }
            } catch (err) {
                if (err instanceof TypeError)
                    setLoadingError('Unable to reach the server.');
                else
                    setLoadingError(err.message);
            } finally {
                setLoading(false);
            }
        }, [page, pageSize]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const nextPage = useCallback(() => {
        setPage(p => clamp(p + 1, 0, Math.ceil(total/pageSize)-1))
    }, [total, pageSize]);

    const prevPage = useCallback(() => {
        setPage(p => clamp(p-1, 0, Math.ceil(total/pageSize)-1));
    }, [total, pageSize]);

    const deleteConversation = useCallback(async (id) => {
        try {
            const response = await client.delete(`api/admin/email/conversations/${id}`);
            if (!response.ok){
                let message = 'Failed to delete conversation.';
                try {
                    const err = await response.json();
                    message = err.warning ?? err.message ?? message;
                } catch { /* Empty */}
                throw new Error(message);
            }
            await fetchConversations();
            showToast("Conversation has been deleted", "success");
        } catch (err) {
            if (err instanceof TypeError)
                showToast('Unable to reach the server.', "danger");
            else
                showToast(err.message, "danger");
        }
    }, [fetchConversations]);

    const markRead = useCallback(async (id) => {
        try {
            const response = await client.post(`api/admin/email/conversations/${id}/read`);
            if (!response.ok) throw new Error("Failed to mark as read.");
            await fetchConversations();
        } catch (err) {
            showToast(err instanceof TypeError ? "Unable to reach server." : err.message ?? "Invalid response from server.");
        }
    });

    return { 
        conversations, total, loading, loadingError,
        page, setPage, pageSize, setPageSize,
        nextPage, prevPage, deleteConversation, refresh: fetchConversations,
        unreads, markRead
    };

};

export default useConversations;