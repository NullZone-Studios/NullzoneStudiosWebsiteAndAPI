import './AdminPanel.css';
import { Link } from 'react-router-dom';
import AdminAboutUs from '../../Components/Backend/AdminAboutUs';
import AdminProjects from '../../Components/Backend/AdminProjects';
import AdminBlog from '../../Components/Backend/AdminBlog';
import AdminMessages from '../../Components/Backend/AdminMessages';
import useEmployees from '../../hooks/useEmployees';
import useProjects from '../../hooks/useProjects';
import useBlog from '../../hooks/useBlog';

const navItems = [
    { href: '#admin-about-us', icon: 'bi-people-fill',   label: 'About Us'  },
    { href: '#admin-projects', icon: 'bi-folder-fill',   label: 'Projects'  },
    { href: '#admin-blog',     icon: 'bi-stack',          label: 'Blog'      },
    { href: '#admin-messages', icon: 'bi-envelope-fill', label: 'Messages'  },
];

function AdminPanel() {
    const employees = useEmployees();
    const projects = useProjects();
    const blog = useBlog();

    return (
        <div className="admin-panel">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">
                    NullZone<br /><span>Admin Panel</span>
                </div>
                <nav className="admin-sidebar-nav">
                    <ul>
                        {navItems.map(item => (
                            <li key={item.href}>
                                <a href={item.href}>
                                    <i className={`bi ${item.icon}`}></i>
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="admin-sidebar-footer">
                    <Link to="/" className="admin-btn admin-btn-ghost admin-view-site-btn">
                        <i className="bi bi-arrow-left"></i> View Site
                    </Link>
                </div>
            </aside>
            <main className="admin-main">
                <AdminAboutUs data={employees.employees} />
                <AdminProjects data={projects.projects} />
                <AdminBlog data={blog.posts} callback={{ updatePost: blog.updatePost, createPost: blog.createPost }} />
                <AdminMessages />
            </main>
        </div>
    );
}

export default AdminPanel;
