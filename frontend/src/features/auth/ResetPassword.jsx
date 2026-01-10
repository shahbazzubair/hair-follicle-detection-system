import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import styles from './ForgotPassword.module.css'; // Reusing your existing CSS

const ResetPassword = () => {
    const { token } = useParams(); 
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return Swal.fire("Error", "Passwords do not match", "error");
        }

        setLoading(true);
        try {
            const response = await axios.post(`http://localhost:8000/api/auth/reset-password/${token}`, { 
                password 
            });

            if (response.data.status === 'success') {
                Swal.fire("Success", "Password updated successfully!", "success");
                navigate('/login');
            }
        } catch (err) {
            Swal.fire("Error", err.response?.data?.detail || "Link expired or invalid", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2>Set New Password</h2>
                <p>Enter your new secure password below.</p>
                <form onSubmit={handleReset}>
                    <div className={styles.inputGroup}>
                        <label>New Password</label>
                        <input 
                            type="password" 
                            placeholder="Min 6 characters" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Confirm Password</label>
                        <input 
                            type="password" 
                            placeholder="Repeat password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;