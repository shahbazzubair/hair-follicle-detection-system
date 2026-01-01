import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import styles from './Signup.module.css';

const Signup = () => {
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false); // Added loading state for better UX
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    specialization: '',
    degree: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, degree: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Password validation
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Passwords do not match!',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    setLoading(true); // Start loading

    try {
      let response;
      
      if (role === 'patient') {
        const patientData = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        };
        response = await axios.post('http://localhost:8000/api/auth/signup/patient', patientData);
      } else {
        const doctorData = new FormData();
        doctorData.append("fullName", formData.fullName);
        doctorData.append("email", formData.email);
        doctorData.append("phone", formData.phone);
        doctorData.append("password", formData.password);
        doctorData.append("specialization", formData.specialization);
        if (formData.degree) {
          doctorData.append("degree", formData.degree);
        }

        response = await axios.post('http://localhost:8000/api/auth/signup/doctor', doctorData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      if (response.data.status === "success") {
        if (role === 'doctor') {
          // UC-9: Inform doctor about the 24h verification wait time
          await Swal.fire({
            icon: 'success',
            title: 'Registration Received!',
            text: 'Doctor profile created. Please wait up to 24 hours for Admin to verify your degree. You can only login after verification.',
            confirmButtonColor: '#2563eb',
            allowOutsideClick: false
          });
        } else {
          await Swal.fire({
            icon: 'success',
            title: 'Registration Successful!',
            text: 'Welcome to HairCare AI. You can now log in.',
            confirmButtonColor: '#2563eb',
            timer: 2000,
            showConfirmButton: false
          });
        }
        
        navigate('/login');
      }
    } catch (error) {
      console.error("Signup Error:", error.response?.data?.detail || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.response?.data?.detail || 'An account with this email may already exist.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.roleToggle}>
          <button 
            type="button"
            className={role === 'patient' ? styles.activeTab : styles.tab} 
            onClick={() => setRole('patient')}
          >
            Patient
          </button>
          <button 
            type="button"
            className={role === 'doctor' ? styles.activeTab : styles.tab} 
            onClick={() => setRole('doctor')}
          >
            Doctor
          </button>
        </div>

        <div className={styles.headerArea}>
          <h2>{role === 'patient' ? 'Create Patient Account' : 'Join as a Doctor'}</h2>
          <p>Join our AI-powered hair follicle analysis platform.</p>
        </div>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" required />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" required />
            </div>

            <div className={styles.inputGroup}>
              <label>Contact Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+92 300 1234567" required />
            </div>

            {role === 'doctor' && (
              <>
                <div className={styles.inputGroup}>
                  <label>Specialization</label>
                  <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="Dermatologist" required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Degree Verification</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} required className={styles.fileInput} />
                </div>
              </>
            )}

            <div className={styles.inputGroup}>
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
            </div>

            <div className={styles.inputGroup}>
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Processing...' : `Sign Up as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>

        <p className={styles.switchAuth}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;