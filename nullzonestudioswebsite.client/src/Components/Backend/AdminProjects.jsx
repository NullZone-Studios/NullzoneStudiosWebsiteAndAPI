import { useState } from 'react';

const initialProjects = [
    { id: 1, title: 'Itch.IO',                           content: 'We have an Itch.IO page where you can check our old prototypes.',                            href: 'https://nullzone-studios.itch.io',                                         bannerImg: '' },
    { id: 2, title: '3D Python engine',                  content: 'We recently made a simple 3D game engine using python.',                                     href: 'https://nullzone-studios.itch.io/space-zap-3d',                            bannerImg: '' },
    { id: 3, title: 'Proxima Survival',                  content: 'Our flagship game.',                                                                         href: '',                                                                         bannerImg: '' },
    { id: 4, title: 'Fantasia: The Village Must Survive', content: '',                                                                                           href: 'https://nullzone-studios.itch.io/fantasia-the-village-must-survive',       bannerImg: '' },
    { id: 5, title: 'Blog site',                         content: 'We are creating a blog where we will periodically post updates about our projects.',         href: '',                                                                         bannerImg: '' },
];

const empty = { title: '', content: '', href: '', bannerImg: '' };

function AdminProjects() {
    const [projects,  setProjects]  = useState(initialProjects);
    const [editingId, setEditingId] = useState(null);
    const [showForm,  setShowForm]  = useState(false);
    const [form,      setForm]      = useState(empty);

    const onChange  = e => setForm({ ...form, [e.target.name]: e.target.value });
    const openAdd   = () => { setEditingId(null); setForm(empty); setShowForm(true); };
    const openEdit  = p => { setEditingId(p.id); setForm({ title: p.title, content: p.content, href: p.href, bannerImg: p.bannerImg }); setShowForm(true); };
    const cancel    = () => { setEditingId(null); setShowForm(false); setForm(empty); };
    const deleteRow = id => setProjects(projects.filter(p => p.id !== id));

    const save = () => {
        if (!form.title.trim()) return;
        if (editingId) {
            setProjects(projects.map(p => p.id === editingId ? { ...p, ...form } : p));
        } else {
            setProjects([...projects, { id: Date.now(), ...form }]);
        }
        cancel();
    };

    return (
        <section className="admin-section" id="admin-projects">
            <div className="admin-section-header">
                <h2>Projects</h2>
                <button className="admin-btn admin-btn-primary" onClick={openAdd}>
                    <i className="bi bi-plus-lg"></i> Add Project
                </button>
            </div>
            <div className="admin-section-body">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Link</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(p => (
                            <tr key={p.id}>
                                <td>{p.title}</td>
                                <td>{p.content || <span style={{ opacity: 0.35 }}>—</span>}</td>
                                <td>
                                    {p.href
                                        ? <a href={p.href} target="_blank" rel="noreferrer" style={{ opacity: 0.7 }}>↗ link</a>
                                        : <span style={{ opacity: 0.35 }}>—</span>}
                                </td>
                                <td>
                                    <div className="actions">
                                        <button className="admin-btn admin-btn-ghost" onClick={() => openEdit(p)}>Edit</button>
                                        <button className="admin-btn admin-btn-danger" onClick={() => deleteRow(p.id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {showForm && (
                    <div className="admin-form">
                        <h4>{editingId ? 'Edit Project' : 'Add Project'}</h4>
                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label>Title</label>
                                <input type="text" name="title" value={form.title} onChange={onChange} placeholder="Project title" />
                            </div>
                            <div className="admin-form-group">
                                <label>Link (optional)</label>
                                <input type="url" name="href" value={form.href} onChange={onChange} placeholder="https://…" />
                            </div>
                        </div>
                        <div className="admin-form-group">
                            <label>Banner Image URL (optional)</label>
                            <input type="url" name="bannerImg" value={form.bannerImg} onChange={onChange} placeholder="https://…" />
                        </div>
                        <div className="admin-form-group">
                            <label>Description</label>
                            <textarea name="content" rows={3} value={form.content} onChange={onChange} placeholder="Project description…" />
                        </div>
                        <div className="admin-form-actions">
                            <button className="admin-btn admin-btn-ghost" onClick={cancel}>Cancel</button>
                            <button className="admin-btn admin-btn-primary" onClick={save}>
                                {editingId ? 'Save Changes' : 'Add Project'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default AdminProjects;
