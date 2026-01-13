import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import styles from './ForgotPassword.module.css';

const ResetPassword = () => {
    const { token } = useParams(); 
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Real-time validation checks to match Signup and Backend policy
    const passwordChecks = useMemo(() => ({
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }), [password]);

    const isPasswordSecure = Object.values(passwordChecks).every(Boolean);

    const handleReset = async (e) => {
        e.preventDefault();

        // Final security check before sending to backend
        if (!isPasswordSecure) {
            return Swal.fire({
                icon: "error",
                title: "Weak Password",
                text: "Please follow all security requirements in the checklist.",
                confirmButtonColor: "#2563eb"
            });
        }

        if (password !== confirmPassword) {
            return Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Passwords do not match!",
                confirmButtonColor: "#2563eb"
            });
        }

        setLoading(true);
        try {
            const response = await axios.post(`http://localhost:8000/api/auth/reset-password/${token}`, { 
                password 
            });

            if (response.data.status === 'success') {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Password updated successfully!",
                    confirmButtonColor: "#2563eb"
                });
                navigate('/login');
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.response?.data?.detail || "Link expired or invalid",
                confirmButtonColor: "#ef4444"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2>Set New Password</h2>
                <p>Create a secure password for your account.</p>
                <form onSubmit={handleReset}>
                    <div className={styles.inputGroup}>
                        <label>New Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />

                        {/* LIVE PASSWORD CHECKLIST */}
                        <div className={styles.passwordRequirements}>
                            <div className={`${styles.requirement} ${passwordChecks.length ? styles.valid : styles.invalid}`}>
                                {passwordChecks.length ? '✓' : '○'} 8+ Characters
                            </div>
                            <div className={`${styles.requirement} ${passwordChecks.upper ? styles.valid : styles.invalid}`}>
                                {passwordChecks.upper ? '✓' : '○'} One Uppercase Letter
                            </div>
                            <div className={`${styles.requirement} ${passwordChecks.lower ? styles.valid : styles.invalid}`}>
                                {passwordChecks.lower ? '✓' : '○'} One Lowercase Letter
                            </div>
                            <div className={`${styles.requirement} ${passwordChecks.number ? styles.valid : styles.invalid}`}>
                                {passwordChecks.number ? '✓' : '○'} One Number
                            </div>
                            <div className={`${styles.requirement} ${passwordChecks.special ? styles.valid : styles.invalid}`}>
                                {passwordChecks.special ? '✓' : '○'} One Special Character
                            </div>
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Confirm Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className={styles.submitBtn} 
                        disabled={loading || !isPasswordSecure}
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;