import React, { useState, useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import RobbyProfile from "../../../assets/images/RobbyProfile.svg"
import './UserProfile.css'

function UserProfile({ isOpen, onClose, profilePicture, name, lastName, displayName, email, birthdate, gender, about, onSave }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name, lastName, displayName, email, birthdate, gender, about, profilePicture });
    const { updateProfile } = useAuth();
    const [saveError, setSaveError] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setIsEditing(false), 0);
        }
        setFormData({ name, lastName, displayName, email, birthdate, gender, about, profilePicture });

    }, [isOpen, about, birthdate, displayName, email, gender, lastName, name, profilePicture]);

    const updateField = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

    const saveProfile = async () => {
        setSaveError(null);
        setSaving(true);
        try {
            await updateProfile({
                firstName: formData.name,
                lastName: formData.lastName,
                displayName: formData.displayName,
                email: formData.email,
                birthdate: formData.birthdate,
                gender: formData.gender,
                about: formData.about,
                profileImage: formData.profilePicture
            });
            if (onSave) onSave({ ...formData, profilePicture });
            setIsEditing(false);
        } catch (err) {
            setSaveError(err.message || 'Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }

    };

    const cancelEdit = () => {
        setFormData({ name, lastName, displayName, email, birthdate, gender, about });
        setIsEditing(false);
    };

    return (
        <>
            {isOpen && <div className="user-profile-overlay" onClick={onClose}></div>}
            <aside className={`user-profile-panel ${isOpen ? "open" : ""}`}>
                <div className="user-profile-container">
                    <button className="close-btn" onClick={onClose}>&times;</button>

                    <div className="profile-top-row">
                        <h2>User Profile</h2>
                        {!isEditing && (
                            <button className="edit-profile-btn" title="Edit Profile" onClick={() => setIsEditing(true)}>
                                <i className="bi bi-pencil" />
                            </button>
                        )}
                    </div>

                    <div className="user-profile">
                        <div className="profile-header">
                            <img src={formData.profileImage ?? RobbyProfile} alt="" className="profile-picture" />
                            <h1>{formData.displayName || `${formData.name} ${formData.lastName}`}</h1>
                        </div>
                        <div className="profile-details">
                            <div className="profile-field">
                                <strong>First name:</strong>
                                {isEditing ? <input value={formData.name} onChange={updateField('name')} /> : <span>{formData.name}</span>}
                            </div>
                            <div className="profile-field">
                                <strong>Last name:</strong>
                                {isEditing ? <input value={formData.lastName} onChange={updateField('lastName')} /> : <span>{formData.lastName}</span>}
                            </div>
                            <div className="profile-field">
                                <strong>Display name:</strong>
                                {isEditing ? <input value={formData.displayName} onChange={updateField('displayName')} /> : <span>{formData.displayName}</span>}
                            </div>
                            <div className="profile-field">
                                <strong>Email:</strong>
                                {isEditing ? <input type="email" value={formData.email} onChange={updateField('email')} /> : <span>{formData.email}</span>}
                            </div>
                            <div className="profile-field">
                                <strong>Birthday:</strong>
                                {isEditing ? <input type="date" value={formData.birthdate} onChange={updateField('birthdate')} /> : <span>{formData.birthdate}</span>}
                            </div>
                            <div className="profile-field">
                                <strong>Gender:</strong>
                                {isEditing ? <input value={formData.gender} onChange={updateField('gender')} /> : <span>{formData.gender}</span>}
                            </div>
                            <div className="profile-field">
                                <strong>About:</strong>
                                {isEditing ? <textarea value={formData.about} onChange={updateField('about')} /> : <span>{formData.about}</span>}
                            </div>
                        </div>

                        {isEditing && (
                            <div className="profile-edit-actions">
                                {saveError && <p className="save-error">{saveError}</p>}
                                <button className="save-btn" onClick={saveProfile} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}

export default UserProfile;