import { useState, useEffect, useCallback } from "react";
import client from "../api/client";

const useBlog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await client.get("/api/blog");
                if (!response.ok) {
                    let message = 'Failed to fetch blog posts.';
                    try {
                        const error = await response.json();
                        message = error.message ?? message;
                    } catch { /* Empty */ }
                    throw new Error(message);
                }
                try {
                    const data = await response.json();
                    setPosts(data);
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

        fetchPosts();
    }, []);

    const react = useCallback(async (postID, type) => {
        const response = await client.post(`/api/blog/${postID}/react`, { Type: type });
        if (!response.ok) throw new Error('Failed to react to post.');
        const data = await response.json();

        setPosts(prev => prev.map(post =>

            post.id === postID
                ? { ...post, likes: data.likes, dislikes: data.dislikes }
                : post
        ));
    }, []);

    const comment = useCallback(async (postID, content) => {
        const response = await client.post(`/api/blog/${postID}/comment`, { Content: content });
        if (!response.ok) throw new Error('Failed to post comment.');
        const data = await response.json();
        return data;
    }, []);

    const deletePost = useCallback(async (postID) => {
        const response = await client.delete(`/api/blog/${postID}`);
        if (!response.ok) throw new Error('Failed to delete post.');
        setPosts(prev => prev.filter(post => post.id !== postID));
    }, []);

    const getComments = useCallback(async (postID) => {
        const response = await client.get(`/api/blog/${postID}/comments`);
        if (!response.ok) throw new Error('Failed to fetch comments.');
        return await response.json();
    }, []);

    const updatePost = useCallback(async (updatedPost) => {
        const response = await client.put(`/api/blog/${updatedPost.id}`, updatedPost);
        if (!response.ok) throw new Error('Failed to update post.');
        const data = await response.json();
        setPosts(prev => prev.map(post => post.id === updatedPost.id ? data : post));
    }, []);

    const createPost = useCallback(async (newPost) => {
        const response = await client.post(`/api/blog`, newPost);
        if (!response.ok) throw new Error('Failed to create post.');
        const data = await response.json();
        setPosts(prev => [...prev, data]);
        return data;
    }   , []);

    return { posts, loading, error, react, comment, deletePost, getComments, updatePost, createPost };
};

export default useBlog;
