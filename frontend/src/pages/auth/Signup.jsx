import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import styles from './Signup.module.css';

// Validation Regex Constants
const PAK_PHONE_REGEX = /^(?:(?:\+92|0092|92)\s?3[0-9]{2}|03[0-9]{2})[\s-]?[0-9]{7}$/;
const NAME_REGEX = /^[a-zA-Z\s.]{3,50}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function Signup() {
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '', specialization: '', degree: null
  });

  const [touched, setTouched] = useState({
    fullName: false, email: false, phone: false, password: false, confirmPassword: false, specialization: false
  });

  // Password Security Checks
  const passwordChecks = useMemo(() => ({
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    number: /\d/.test(formData.password)
  }), [formData.password]);

  const isPasswordSecure = Object.values(passwordChecks).every(Boolean);
  const isNameValid = NAME_REGEX.test(formData.fullName.trim());
  const isEmailValid = EMAIL_REGEX.test(formData.email.trim());
  const isPhoneValid = PAK_PHONE_REGEX.test(formData.phone.trim());
  const doPasswordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const isSpecValid = role === 'doctor' ? formData.specialization.trim().length >= 3 : true;
  const isDegreeSelected = role === 'doctor' ? Boolean(formData.degree) : true;

  const isFormValid = isNameValid && isEmailValid && isPhoneValid && isPasswordSecure && doPasswordsMatch && isSpecValid && isDegreeSelected;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const ext = file.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(file.type) && !['jpg', 'jpeg', 'png', 'pdf'].includes(ext)) {
        Swal.fire('Invalid File Format', 'Only JPG, PNG images and PDF documents are supported for degree verification.', 'warning');
        e.target.value = '';
        setFormData({ ...formData, degree: null });
        return;
      }
      setFormData({ ...formData, degree: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isNameValid) {
      return Swal.fire('Invalid Name', 'Full Name must contain at least 3 letters (alphabetic characters only).', 'warning');
    }
    if (!isEmailValid) {
      return Swal.fire('Invalid Email', 'Please enter a valid email address.', 'warning');
    }
    if (!isPhoneValid) {
      return Swal.fire('Invalid Phone Number', 'Please enter a valid Pakistani mobile number (e.g., 03001234567 or +923001234567).', 'warning');
    }
    if (!isPasswordSecure) {
      return Swal.fire('Weak Password', 'Please satisfy all 5 password security criteria.', 'warning');
    }
    if (!doPasswordsMatch) {
      return Swal.fire('Password Mismatch', 'Confirm password does not match.', 'warning');
    }
    if (role === 'doctor' && !formData.degree) {
      return Swal.fire('Degree Required', 'Please upload your medical verification degree (JPG, PNG, or PDF).', 'warning');
    }

    setLoading(true);
    try {
      if (role === 'patient') {
        await axios.post('http://localhost:8000/api/auth/signup/patient', {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password
        });
      } else {
        const doctorData = new FormData();
        doctorData.append("fullName", formData.fullName.trim());
        doctorData.append("email", formData.email.trim());
        doctorData.append("phone", formData.phone.trim());
        doctorData.append("password", formData.password);
        doctorData.append("specialization", formData.specialization.trim());
        if (formData.degree) doctorData.append("degree", formData.degree);
        
        await axios.post('http://localhost:8000/api/auth/signup/doctor', doctorData, { 
          headers: { "Content-Type": "multipart/form-data" } 
        });
      }
      
      Swal.fire('Success!', role === 'doctor' ? 'Doctor account registered. Pending admin verification.' : 'Welcome! Account created successfully. You can now log in.', 'success');
      navigate('/login');
    } catch (error) {
      Swal.fire('Failed', error.response?.data?.detail || 'Registration failed. Please check your details.', 'error');
    } finally {
      setLoading(false);
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
        
        <h2>{role === 'patient' ? 'Create Patient Account' : 'Join as a Doctor'}</h2>
        <p>Complete the form below to get started.</p>
        
        <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
          {/* Full Name */}
          <div className={styles.inputGroup}>
            <label>Full Name</label>
            <input 
              type="text" 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="off"
              placeholder="e.g. Ali Ahmed"
              className={touched.fullName && !isNameValid ? styles.inputError : touched.fullName && isNameValid ? styles.inputSuccess : ''}
              required 
            />
            {touched.fullName && !isNameValid && (
              <span className={styles.fieldError}>Please enter a valid full name (letters only, min 3 characters).</span>
            )}
          </div>

          {/* Email Address */}
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="off"
              placeholder="name@example.com"
              className={touched.email && !isEmailValid ? styles.inputError : touched.email && isEmailValid ? styles.inputSuccess : ''}
              required 
            />
            {touched.email && !isEmailValid && (
              <span className={styles.fieldError}>Please enter a valid email address.</span>
            )}
          </div>

          {/* Pakistani Phone Number */}
          <div className={styles.inputGroup}>
            <label>Pakistani Contact Number</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="off"
              placeholder="e.g. 03001234567 or +923001234567"
              className={touched.phone && !isPhoneValid ? styles.inputError : touched.phone && isPhoneValid ? styles.inputSuccess : ''}
              required 
            />
            {touched.phone && !isPhoneValid ? (
              <span className={styles.fieldError}>Invalid Pakistani format! Must start with 03 or +923 (11 digits).</span>
            ) : (
              <span className={styles.fieldHint}>Format: 03001234567, 03123456789, or +923001234567</span>
            )}
          </div>

          {/* Doctor Specific Fields */}
          {role === 'doctor' && (
            <>
              <div className={styles.inputGroup}>
                <label>Medical Specialization</label>
                <input 
                  type="text" 
                  name="specialization" 
                  value={formData.specialization} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="off"
                  placeholder="e.g. Dermatologist / Trichologist"
                  className={touched.specialization && !isSpecValid ? styles.inputError : ''}
                  required 
                />
                {touched.specialization && !isSpecValid && (
                  <span className={styles.fieldError}>Specialization must be at least 3 characters.</span>
                )}
              </div>
              <div className={styles.inputGroup}>
                <label>Medical Degree / Certificate (JPG, PNG, or PDF)</label>
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" 
                  onChange={handleFileChange} 
                  required 
                  className={styles.fileInput}
                />
                <span className={styles.fieldHint}>Supported: JPG, PNG, PDF only</span>
              </div>
            </>
          )}

          {/* Password */}
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="new-password"
              placeholder="Create a secure password"
              required 
            />
            <div className={styles.passwordRequirements}>
              <div className={passwordChecks.length ? styles.valid : styles.invalid}>{passwordChecks.length ? '✓' : '○'} 8+ Characters</div>
              <div className={passwordChecks.upper ? styles.valid : styles.invalid}>{passwordChecks.upper ? '✓' : '○'} One Uppercase</div>
              <div className={passwordChecks.lower ? styles.valid : styles.invalid}>{passwordChecks.lower ? '✓' : '○'} One Lowercase</div>
              <div className={passwordChecks.number ? styles.valid : styles.invalid}>{passwordChecks.number ? '✓' : '○'} One Number</div>
              <div className={passwordChecks.special ? styles.valid : styles.invalid}>{passwordChecks.special ? '✓' : '○'} One Special Char</div>
            </div>
          </div>
          
          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <label>Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              className={formData.confirmPassword ? (doPasswordsMatch ? styles.inputSuccess : styles.inputError) : ''}
              required 
            />
            {formData.confirmPassword && (
              <span className={doPasswordsMatch ? styles.matchValid : styles.matchInvalid}>
                {doPasswordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </span>
            )}
          </div>
          
          <button type="submit" className={styles.submitBtn} disabled={loading || !isFormValid}>
            {loading ? 'Processing...' : 'Sign Up'}
          </button>
        </form>
        <p className={styles.switchAuth}>Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
}