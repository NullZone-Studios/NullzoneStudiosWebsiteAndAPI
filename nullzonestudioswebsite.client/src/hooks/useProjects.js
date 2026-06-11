import { useState, useEffect } from "react";
import client from "../api/client";

const useProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await client.get('/api/projects/latest');
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

    const updateProject = async (id, updatedData) => {
        const response = await client.put(`/api/projects/${id}`, updatedData);
        if (!response.ok) {
            let message = 'Failed to update project.';
            setError(message);
        }
        setProjects(prev => prev.map(proj => proj.id === id ? { ...proj, ...updatedData } : proj));
    };

    const addProject = async (projectData) => {
        const response = await client.post(`/api/projects`, projectData);
        if (!response.ok) {
            let message = 'Failed to add project.';
            setError(message);
        }
        const createdProject = await response.json().catch(() => null);
        setProjects(prev => [...prev, createdProject ? { ...projectData, ...createdProject } : projectData]);
    };

    const deleteProject = async (id) => {
        const response = await client.delete(`/api/projects/${id}`);
        if (!response.ok) {
            let message = 'Failed to delete project.';
            setError(message);
        }
        setProjects(prev => prev.filter(proj => proj.id !== id));
    };

    return { projects, loading, error, updateProject, addProject, deleteProject };
}

export default useProjects;