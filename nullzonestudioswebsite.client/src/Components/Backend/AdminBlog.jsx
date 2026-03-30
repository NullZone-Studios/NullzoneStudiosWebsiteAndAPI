import { useEffect, useRef, useState } from 'react';

const initialPosts = [
    { id: 1, title: 'First Post',  content: 'This is the first post.',  author: 'Author A', postImage: '', createdAt: '2026-03-25T13:34:00' },
    { id: 2, title: 'Second Post', content: 'Lorem ipsum dolor sit amet…', author: 'Author B', postImage: '', createdAt: '2026-03-25T11:10:00' },
    { id: 3, title: 'Third Post',  content: 'This is the third post.',  author: 'Author C', postImage: '', createdAt: '2026-03-23T09:00:00' },
    { id: 4, title: 'Fourth Post', content: 'This is the fourth post.', author: 'Author D', postImage: '', createdAt: '2026-03-19T16:20:00' },
    { id: 5, title: 'Fifth Post',  content: 'This is the fifth post.',  author: 'Author E', postImage: '', createdAt: '2026-03-10T08:15:00' },
];

const empty = { Title: '', Content: '', PostImageUrl: '' };

// TODO: replace with real auth context once authentication is wired up
const currentUser = 'Admin';

const fmt = str => {
    const d = new Date(str);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

function AdminBlog({ data, editPostId, callback = {} }) {
    const [posts,     setPosts]     = useState(Array.isArray(data) ? data : initialPosts);
    const [editingId, setEditingId] = useState(null);
    const [showForm,  setShowForm]  = useState(false);
    const [form,      setForm]      = useState(empty);
    const handledEditPostIdRef = useRef(null);

    useEffect(() => {
        if (Array.isArray(data)) {
            setPosts(data);
        }
    }, [data]);

    useEffect(() => {
        if (!editPostId || handledEditPostIdRef.current === editPostId) {
            return;
        }

        const matchedPost = posts.find(p => String(p.id) === String(editPostId));

        if (!matchedPost) {
            return;
        }

        openEdit(matchedPost);
        handledEditPostIdRef.current = String(editPostId);

        document.getElementById('admin-blog')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }, [editPostId, posts]);

    const onChange  = e => setForm({ ...form, [e.target.name]: e.target.value });
    const openAdd   = () => { setEditingId(null); setForm(empty); setShowForm(true); };
    const openEdit  = p => {
        setEditingId(p.id);
        setForm({
            Title: p.title ?? '',
            Content: p.content ?? '',
            PostImageUrl: p.postImage ?? '',
        });
        setShowForm(true);
    };
    const cancel    = () => { setEditingId(null); setShowForm(false); setForm(empty); };
    const deleteRow = async id => {
        if (callback.deletePost) {
            await callback.deletePost(id);
            return;
        }

        setPosts(posts.filter(p => p.id !== id));
    };


    const save = async () => {
        if (!form.Title.trim()) return;
        if (editingId) {
            if (callback.updatePost) {
                const updatedPost = await callback.updatePost({ ...form, id: editingId, Id: editingId });
                setPosts(posts.map(p => p.id === editingId ? {
                    ...p,
                    title: form.Title,
                    content: form.Content,
                    postImage: form.PostImageUrl,
                    ...(updatedPost ?? {}),
                } : p));
            } else {
                setPosts(posts.map(p => p.id === editingId ? {
                    ...p,
                    title: form.Title,
                    content: form.Content,
                    postImage: form.PostImageUrl,
                } : p));
            }
        } else {
            if (callback.createPost) {
                const createdPost = await callback.createPost({
                    ...form,
                    Author: currentUser,
                    CreatedAt: new Date().toISOString(),
                });
                if (createdPost) {
                    setPosts(prevPosts => [...prevPosts, createdPost]);
                }
            } else {
                setPosts(prevPosts => [
                    ...prevPosts,
                    {
                        id: Date.now(),
                        title: form.Title,
                        content: form.Content,
                        postImage: form.PostImageUrl,
                        author: currentUser,
                        createdAt: new Date().toISOString(),
                    },
                ]);
            }
        }
        cancel();
    };

    return (
        <section className="admin-section" id="admin-blog">
            <div className="admin-section-header">
                <h2>Blog Posts</h2>
                <button className="admin-btn admin-btn-primary" onClick={openAdd}>
                    <i className="bi bi-plus-lg"></i> New Post
                </button>
            </div>
            <div className="admin-section-body">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map(p => (
                            <tr key={p.id}>
                                <td>{p.title}</td>
                                <td>{p.author}</td>
                                <td>{fmt(p.createdAt)}</td>
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
                        <h4>{editingId ? 'Edit Post' : 'New Post'}</h4>
                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label>Title</label>
                                <input type="text" name="Title" value={form.Title} onChange={onChange} placeholder="Post title" />
                            </div>
                            <div className="admin-form-group">
                                <label>Author</label>
                                <input type="text" value={currentUser}  disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                            </div>
                        </div>
                        <div className="admin-form-group">
                            <label>Post Image URL (optional)</label>
                            <input type="url" name="PostImageUrl" value={form.PostImageUrl} onChange={onChange} placeholder="https://…" />
                        </div>
                        <div className="admin-form-group">
                            <label>Content</label>
                            <textarea name="Content" rows={7} value={form.Content} onChange={onChange} placeholder="Write your post…" />
                        </div>
                        <div className="admin-form-actions">
                            <button className="admin-btn admin-btn-ghost" onClick={cancel}>Cancel</button>
                            <button className="admin-btn admin-btn-primary" onClick={save}>
                                {editingId ? 'Save Changes' : 'Publish Post'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default AdminBlog;
