import { useState, useCallback, useRef } from "react";
import client from "../api/client";
import { showToast } from "../Components/toast";

const useConversation = () => {
   const [conversation, setConversation] = useState(null);
   const [emails, setEmails] = useState([]);
   const [loading, setLoading] = useState(false);
   const [loadingMore, setLoadingMore] = useState(false);
   const [hasMore, setHasMore] = useState(false);
   const [sending, setSending] = useState(false);
   const pageRef = useRef(0);
   const pageSize = 10;

    const errorToast = (error) => {
        showToast(error instanceof TypeError ? "Unable to reach server." : error.message ?? error.warning ?? "Invalid response from server.", "danger");
    }

    const fetch = useCallback(async (id) => {
        setLoading(true);
        pageRef.current = 0;
        try{
            const response = await client.get(`api/admin/email/conversations/${id}?page=0&pageSize=${pageSize}`);
            if (!response.ok) throw new Error("Failed to fetch conversation.");
            const data = await response.json();
            setConversation(data);
            setEmails(data.emails);
            setHasMore(data.totalEmails > pageSize);
        } catch (err) {
            errorToast(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadOlder = useCallback(async () => {
        if (!conversation || loadingMore || !hasMore) return;
        const nextPage = pageRef.current + 1;
        setLoadingMore(true);
        try{
            const response = await client.get(`api/admin/email/conversations/${conversation.id}?page=${nextPage}&pageSize=${pageSize}`);
            if (!response.ok) throw new Error("Failed to load more.");
            const data = await response.json();
            setEmails(prev => [...data.emails, ...prev]);
            pageRef.current = nextPage;
            setHasMore(data.emails.length === pageSize && (nextPage + 1) * pageSize < data.totalEmails);
        } catch (err) {
            errorToast(err);
        } finally {
            setLoadingMore(false);
        }
    }, [conversation, loadingMore, hasMore]);

    const fetchEmailHtml = useCallback(async (emailID) => {
        try {
            const response = await client.get(`api/admin/email/conversations/${conversation.id}/${emailID}`);
            if (!response.ok) throw new Error("Failed to fetch email.");
            const data = await response.json();
            return data.htmlBody ?? data.textBody;
        } catch (err) {
            errorToast(err);
            return null;
        }
    }, [conversation]);

    const reply = useCallback(async (emailID, body) => {
        setSending(true);
        try {
            const response = await client.post("api/admin/email/reply", {
                emailID: emailID,
                to: conversation.sender?.email ?? null,
                body
            });
            if (!response.ok) {
                const err = await response.json().catch(() => null);
                throw new Error(err.message ?? "Failed to send reply.");
            }
            const sent = await response.json().catch(() => null);
            if (sent) setEmails(prev => [...prev, sent]);
            showToast("Reply sent.", "success");
        } catch (err) {
            errorToast(err);
        } finally {
            setSending(false);
        }
    }, [conversation]);

    const close = useCallback(() => {
        setConversation(null);
        setEmails([]);
        setHasMore(false);
        pageRef.current = 0;
    }, []);

    return {
        conversation, emails, loading, loadingMore,
        hasMore, sending, fetch, close,
        fetchEmailHtml, reply, loadOlder, sender: conversation?.sender ?? null
    };
};

export default useConversation;