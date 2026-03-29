import { useState, useEffect } from "react";
import client from "../api/client";

const useProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await client.get('/api/projects');
                if (!response.ok) {
                    let message = 'Failed to fetch projects.';
                    try {
                        const error = await response.json();
                        message = error.message ?? message;
                    } catch { /* Do nothing */ }
                    throw new Error(message);
                }
                try {
                    const data = await response.json();
                    setProjects(data);
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

        fetchProjects();
    }, []);

    return { projects, loading, error };
}

export default useProjects;