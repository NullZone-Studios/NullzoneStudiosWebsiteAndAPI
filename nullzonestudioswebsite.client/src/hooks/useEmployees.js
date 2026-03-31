import { useState, useEffect } from "react";
import client from "../api/client";

const getResponseMessage = async (response, fallbackMessage) => {
    try {
        const data = await response.json();
        if (data?.message) {
            return data.message;
        }
    } catch {
        // Ignore invalid or empty response bodies and fall back to a generic message.
    }

    return fallbackMessage;
};

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

    const updateEmployee = async (id, updatedData) => {
        const response = await client.put(`/api/employees/${id}/employee`, updatedData);
        if (!response.ok) {
            const message = await getResponseMessage(response, 'Failed to update employee.');
            setError(message);
            return false;
        }

        setEmployees(prev => prev.map(emp => emp.userID === id ? { ...emp, ...updatedData } : emp));
        setError(null);
        return true;
    };

    const addEmployee = async (employeeData) => {
        const response = await client.post(`/api/employees/${employeeData.userID}/employee`, employeeData);
        if (!response.ok) {
            const message = await getResponseMessage(response, 'Failed to add employee.');
            setError(message);
            return false;
        }

        const createdEmployee = await response.json().catch(() => null);
        setEmployees(prev => [...prev, createdEmployee ? { ...employeeData, ...createdEmployee } : employeeData]);
        setError(null);
        return true;
    };

    const deleteEmployee = async (id) => {
        const response = await client.delete(`/api/employees/${id}/employee`);
        if (!response.ok) {
            const message = await getResponseMessage(response, 'Failed to delete employee.');
            setError(message);
            return false;
        }

        setEmployees(prev => prev.filter(emp => emp.userID !== id));
        setError(null);
        return true;
    };

    return { employees, loading, error, updateEmployee, addEmployee, deleteEmployee };
}

export default useEmployees;
