import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import client from '../api/client';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleSessionExpired = () => setUser(null);
        window.addEventListener('auth:sessionexpired', handleSessionExpired);
        return () => window.removeEventListener('auth:sessionexpired', handleSessionExpired);
    }, []);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const sessionResponse = await fetch("/api/auth/session", {
                    credentials: 'include'
                });

                if (sessionResponse.ok) {
                    const data = await sessionResponse.json();
                    setUser(data);
                    return;
                }

                const refreshResponse = await client.post('/api/auth/refresh');
                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    setUser(data);
                }
            } catch {
                // Silently fail - no valid session or server offline
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = useCallback(async (usernameOrEmail, password) => {
        try {
            const response = await client.post('/api/auth/login', { usernameOrEmail, password });
            if (!response.ok) {
                let message = 'Login failed';
                try {
                    const error = await response.json();
                    message = error.message ?? message;
                } catch { /* Empty catch */ }
                throw new Error(message ?? 'Login failed.');
            }
            const data = await response.json();
            setUser(data);
            return data;
        } catch (err) {
            if (err instanceof TypeError)
                throw new Error('Unable to reach the server. Please try again later.');
            throw err;
        }
        }, []);

    const getProfile = useCallback(async () => {
        try {
            const response = await client.get('/api/user/profile');
            if (!response.ok) {
                let message = 'Failed to fetch user profile';
                try {
                    const error = await response.json();
                    message = error.message ?? message;
                } catch { /* Empty catch */ }
                throw new Error(message);
            }
            try {
                return await response.json();
            } catch{
                throw new Error('Invalid response from server.');
            }
        } catch (err) {
            if (err instanceof TypeError)
                throw new Error('Unable to reach the server. Please try again later.');
            throw err;
        }
    }, []);

    const updateProfile = useCallback(async (profileData) => {
        try {
            const response = await client.put('/api/user/profile', profileData);
            if (!response.ok) {
                let message = 'Failed to update user profile';
                try {
                    const error = await response.json();
                    message = error.message ?? message;
                } catch { /* Empty catch */ }
                throw new Error(message);
            }
            try {
                return await response.json();
            } catch {
                throw new Error('Invalid response from server.');
            }
        } catch (err) {
            if (err instanceof TypeError)
                throw new Error('Unable to reach the server. Please try again later.');
            throw err;
        }
    }, []);

    const register = useCallback(async (username, email, password, confirmPassword) => {
        try {
            const response = await client.post('/api/auth/register', { username, email, password, confirmPassword });
            if (!response.ok) {
                let message = 'Registration failed';
                try {
                    const error = await response.json();
                    message = error.message ?? message;
                } catch { /* Empty catch */ }
                throw new Error(message ?? 'Registration failed.');
            }
            const data = await response.json();
            setUser(data);
            return data;
        } catch (err) {
            if (err instanceof TypeError)
                throw new Error('Unable to reach the server. Please try again later.');
            throw err;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await client.post('/api/auth/logout');
        } finally {
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, getProfile, updateProfile, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};