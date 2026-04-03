import { useState, useEffect, useCallback } from "react";
import client from "../api/client";
import { clamp } from "../assets/helperFunctions";
import { showToast } from "../Components/toast";

const useConversations = () => {
    const [conversations, setConversations] = useState([]);
    const [total, setTotal] = useState(0);
    const [unreads, setUnreads] = useState(999);
    const [loading, setLoading] = useState(true);
    const [loadingError, setLoadingError] = useState(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [conversation, setConversation] = useState(null);

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

                    let totalUnreads = 0;
                    data.conversations.forEach(conversation => {
                        totalUnreads += conversation.unreadCount;
                    });

                    setUnreads(totalUnreads)
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

    const fetchConversation = useCallback(async (id) => {
        try {
            const response = await client.get(`api/admin/email/conversations/${id}`);
            if (!response.ok){
                let message = "Failed to fetch conversation.";
                try {
                    const err = await response.json();
                    message = err.warning ?? err.message ?? message;
                } catch {/* empty */}
                throw new Error(message);
            }
            try {
                const data = await response.json();
                setConversation(data);
            } catch {
                throw new Error("Invalid response from server.");
            }
        } catch (err) {
            if (err instanceof TypeError)
                showToast("Unable to reach server.", "danger");
            else
                showToast(err.message, "danger");
        }
    }, []);

    return { 
        conversations, total, loading, loadingError,
        page, setPage, pageSize, setPageSize,
        nextPage, prevPage, deleteConversation, refresh: fetchConversations,
        fetch: fetchConversation, conversation, unreads
    };

};

export default useConversations;