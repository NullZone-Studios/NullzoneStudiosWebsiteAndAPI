import { useState, useEffect } from "react";
import client from "../api/client";

const useEmployees= () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployees = async () => {

            try {
                const response = await client.get('/api/employees');
                if (!response.ok) throw new Error('Failed to fetch employees');

                try {
                    const data = await response.json();
                    setEmployees(data);
                } catch (err) {
                    if (err instanceof TypeError)
                        throw new Error('Could not reach server.')
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
        
        fetchEmployees();
    }, []);

    return { employees, loading, error };
}

export default useEmployees;
