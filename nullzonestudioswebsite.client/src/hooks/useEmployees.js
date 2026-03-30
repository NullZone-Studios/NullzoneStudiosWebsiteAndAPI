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
                    const normalizedEmployees = Array.isArray(data)
                        ? data.map((employee, index) => ({
                            id: employee.id
                                ?? employee.ID
                                ?? `${employee.FirstName ?? employee.firstName ?? ""}-${employee.LastName ?? employee.lastName ?? ""}-${index}`,
                            name: `${employee.FirstName ?? employee.firstName ?? ""} ${employee.LastName ?? employee.lastName ?? ""}`.trim(),
                            jobTitle: employee.JobTitle ?? employee.jobTitle ?? "",
                            about: employee.About ?? employee.about ?? "",
                            img: employee.ProfileImage ?? employee.profileImage ?? "",
                        }))
                        : [];

                    setEmployees(normalizedEmployees);
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
