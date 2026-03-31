import { useState, useEffect } from "react";
import client from "../api/client";

const useUser = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await client.get('/api/user/profiles');
                if (!response.ok) throw new Error('Failed to fetch user profiles');
                const users = await response.json();
                setUsers(users);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return { users, loading, error };
};

export default useUser;
