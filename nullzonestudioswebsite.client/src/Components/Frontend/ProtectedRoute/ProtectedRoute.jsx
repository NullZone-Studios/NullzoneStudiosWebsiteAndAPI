import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Throbber from '../Throbber/Throbber';
import Logo from '../../assets/nullzone_logo.png';

const ProtectedRoute = ({ children, requiredLevel }) => {
    const { user, loading } = useAuth();
    if (loading) return <Throbber logo={Logo} />;
    if (!user) return <Navigate to="/login" replace />;
    if (requiredLevel !== undefined && user.accessLevel < requiredLevel)
        return <Navigate to="/" replace />
    
    return children;
}

export default ProtectedRoute;