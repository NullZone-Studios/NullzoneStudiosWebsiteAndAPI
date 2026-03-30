import { useState } from 'react';

const initialTeam = [
    { id: 1, name: 'Philip',    jobTitle: 'Founder, Lead Developer',              about: '', img: '' },
    { id: 2, name: 'Lasse',     jobTitle: 'CEO, Founder, Lead Gameplay Developer', about: '', img: '' },
    { id: 3, name: 'Christian', jobTitle: 'Founder, Lead Project Manager',         about: '', img: '' },
    { id: 4, name: 'Stefanie',  jobTitle: 'Founder, Lead Writer',                  about: '', img: '' },
    { id: 5, name: 'Silas',     jobTitle: 'Founder, Lead 3D Artist',               about: '', img: '' },
];

const emptyMember = { name: '', jobTitle: '', about: '', img: '' };

function AdminAboutUs(data) {
    const [aboutText,  setAboutText]  = useState('Lorem ipsum dolor sit amet, consectetur adipiscing elit…');
    const [visionText, setVisionText] = useState('Lorem ipsum dolor sit amet, consectetur adipiscing elit…');
    const [team,       setTeam]       = useState(initialTeam);
    const [editingId,  setEditingId]  = useState(null);
    const [showForm,   setShowForm]   = useState(false);
    const [form,       setForm]       = useState(emptyMember);

    const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const openAdd = () => { setEditingId(null); setForm(emptyMember); setShowForm(true); };
    const onImageChange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setForm(f => ({ ...f, img: url }));
    };

    const openEdit = m => { setEditingId(m.id); setForm({ name: m.name, jobTitle: m.jobTitle, about: m.about, img: m.img }); setShowForm(true); };
    const cancel   = () => { setEditingId(null); setShowForm(false); setForm(emptyMember); };

    const saveMember = () => {
        if (!form.name.trim()) return;
        if (editingId) {
            setTeam(team.map(m => m.id === editingId ? { ...m, ...form } : m));
        } else {
            setTeam([...team, { id: Date.now(), ...form }]);
        }
        cancel();
    };

    const deleteMember = id => setTeam(team.filter(m => m.id !== id));

    return (
        <section className="admin-section" id="admin-about-us">
            <div className="admin-section-header">
                <h2>About Us</h2>
            </div>
            <div className="admin-section-body">

                {/* ── Text content ── */}
                <div className="admin-form-row">
                    <div className="admin-form-group">
                        <label>About Us Text</label>
                        <textarea rows={5} value={aboutText} onChange={e => setAboutText(e.target.value)} />
                    </div>
                    <div className="admin-form-group">
                        <label>Our Vision Text</label>
                        <textarea rows={5} value={visionText} onChange={e => setVisionText(e.target.value)} />
                    </div>
                </div>
                <div className="admin-form-actions" style={{ marginBottom: '0.5em' }}>
                    <button className="admin-btn admin-btn-primary" style={{ marginTop: '1.5em' }}>Save Text</button>
                </div>

                {/* ── Team members ── */}
                <div className="admin-subsection-header">
                    <h3>Team Members</h3>
                    <button className="admin-btn admin-btn-primary" onClick={openAdd}>
                        <i className="bi bi-plus-lg"></i> Add Member
                    </button>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Photo</th>
                            <th>Name</th>
                            <th>Job Title</th>
                            <th>About</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {team.map(m => (
                            <tr key={m.id}>
                                <td>
                                    {m.img
                                        ? <img src={m.img} alt={m.name} className="admin-avatar" />
                                        : <div className="admin-avatar admin-avatar-placeholder"><i className="bi bi-person-fill"></i></div>
                                    }
                                </td>
                                <td>{m.name}</td>
                                <td>{m.jobTitle}</td>
                                <td>{m.about || <span style={{ opacity: 0.35 }}>—</span>}</td>
                                <td>
                                    <div className="actions">
                                        <button className="admin-btn admin-btn-ghost" onClick={() => openEdit(m)}>Edit</button>
                                        <button className="admin-btn admin-btn-danger" onClick={() => deleteMember(m.id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {showForm && (
                    <div className="admin-form">
                        <h4>{editingId ? 'Edit Member' : 'Add Member'}</h4>
                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label>Name</label>
                                <input type="text" name="name" value={form.name} onChange={onChange} placeholder="Member name" />
                            </div>
                            <div className="admin-form-group">
                                <label>Job Title</label>
                                <input type="text" name="jobTitle" value={form.jobTitle} onChange={onChange} placeholder="e.g. Lead Developer" />
                            </div>
                        </div>
                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label>Photo</label>
                                <div className="admin-image-upload">
                                    {form.img && <img src={form.img} alt="preview" className="admin-avatar admin-avatar-lg" />}
                                    <label className="admin-btn admin-btn-ghost admin-upload-btn">
                                        <i className="bi bi-upload"></i> {form.img ? 'Change Photo' : 'Upload Photo'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={onImageChange}
                                        />
                                    </label>
                                    {form.img && (
                                        <button className="admin-btn admin-btn-danger" onClick={() => setForm(f => ({ ...f, img: '' }))}>
                                            <i className="bi bi-x-lg"></i> Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="admin-form-group">
                                <label>About</label>
                                <textarea name="about" rows={4} value={form.about} onChange={onChange} placeholder="Short bio…" />
                            </div>
                        </div>
                        <div className="admin-form-actions">
                            <button className="admin-btn admin-btn-ghost" onClick={cancel}>Cancel</button>
                            <button className="admin-btn admin-btn-primary" onClick={saveMember}>
                                {editingId ? 'Save Changes' : 'Add Member'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default AdminAboutUs;
