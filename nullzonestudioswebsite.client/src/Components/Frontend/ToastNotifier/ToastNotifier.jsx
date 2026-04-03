import { useEffect, useCallback, useState } from "react";
import Icon from "../Icon/Icon";
import './ToastNotifier.css';

const ToastNotifier = () => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    useEffect(() => {
        const handler = (e) => {
            const { message, type = "info", duration = 3000 } = e.detail;
            const id = Date.now() + Math.random();

            setToasts(prev => [...prev, {id, message, type}]);
            setTimeout(() => removeToast(id), duration);
        };

        window.addEventListener("toast", handler);
        return () => window.removeEventListener("toast", handler);
    }, [removeToast]);

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast 
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}

const Toast = ({message, type, onClose}) => {
    return (
        <div className={`toast toast--${type}`}>
            <span className="toast__message">{message}</span>
            <button className="toast__close" onClick={onClose}><Icon name="x-lg" /></button>
        </div>
    );
};

export default ToastNotifier;