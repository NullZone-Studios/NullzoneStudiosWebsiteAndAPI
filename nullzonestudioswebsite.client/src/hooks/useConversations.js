import { useState, useEffect, useCallback } from "react";
import client from "../api/client";
import { clamp } from "../assets/helperFunctions";

const useConversations = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        const fetchConversations = async (page = 0, pageSize = 10) => {
            setLoading(true);
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
                    setConversations(data);
                } catch {
                    throw new Error('Invalid response from server.');
                }
            } catch (err) {
                if (err instanceof TypeError)
                    setError('Unable to reach the server.');
                else
                    setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations(page, pageSize);
    }, [page, pageSize]);

    const nextPage = useCallback(() => {
        const next = clamp(page + 1, 0, Math.ceil(conversations.total / pageSize) - 1);
        setPage(next);
    }, [page, conversations.total, pageSize]);

    const prevPage = useCallback(() => {
        const prev = clamp(page - 1, 0, Math.ceil(conversations.total / pageSize) - 1);
        setPage(prev);
    }, [page, conversations.total, pageSize]);

    return { conversations, loading, error, page, setPage, pageSize, setPageSize, nextPage, prevPage };

};

export default useConversations;