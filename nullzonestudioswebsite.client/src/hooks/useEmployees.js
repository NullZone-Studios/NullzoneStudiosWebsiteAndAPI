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

    const updateEmployee = async (id, updatedData) => {
        const response = await client.put(`/api/employees/${id}/employee`, updatedData);
        if (!response.ok) {
            let message = 'Failed to update employee.';
            setError(message);
        }
        setEmployees(prev => prev.map(emp => emp.userID === id ? { ...emp, ...updatedData } : emp));
    };

    const addEmployee = async (employeeData) => {
        const response = await client.post(`/api/employees/${employeeData.userID}/employee`, employeeData);
        if (!response.ok) {
            let message = 'Failed to add employee.';
            setError(message);
        }
        const createdEmployee = await response.json().catch(() => null);
        setEmployees(prev => [...prev, createdEmployee ? { ...employeeData, ...createdEmployee } : employeeData]);
    };

    const deleteEmployee = async (id) => {
        const response = await client.delete(`/api/employees/${id}/employee`);
        if (!response.ok) {
            let message = 'Failed to delete employee.';
            setError(message);
        }
        setEmployees(prev => prev.filter(emp => emp.userID !== id));
    };

    return { employees, loading, error, updateEmployee, addEmployee, deleteEmployee };
}

export default useEmployees;
