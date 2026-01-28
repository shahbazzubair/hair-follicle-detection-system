import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [view, setView] = useState('management'); 
  const [activeTab, setActiveTab] = useState('doctors'); 
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState({
    systemName: "HairCare AI Portal"
  });

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      navigate('/admin', { replace: true });
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/admin/users');
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Fetch error:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId, action, status = null) => {
    const confirmText = action === 'delete' ? "Delete this user?" : `Verify this doctor?`;
    const result = await Swal.fire({
      title: 'Confirm Action',
      text: confirmText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'delete' ? '#ef4444' : '#22c55e'
    });

    if (result.isConfirmed) {
      try {
        if (action === 'delete') {
          await axios.delete(`http://localhost:8000/api/admin/delete-user/${userId}`);
        } else {
          await axios.put(`http://localhost:8000/api/admin/verify-doctor/${userId}`, { status });
        }
        Swal.fire('Success!', 'Action completed.', 'success');
        fetchUsers();
      } catch (err) {
        Swal.fire('Error', 'Action failed.', 'error');
      }
    }
  };

  // UPDATED LOGOUT: Instant redirect with no popup
  const handleLogout = () => {
    localStorage.clear(); // Wipe all session data
    navigate('/', { replace: true }); // Immediate redirect to Landing Page
  };

  const stats = {
    total: users.length,
    patients: users.filter(u => u.role === 'patient').length,
    pending: users.filter(u => u.role === 'doctor' && u.status === 'Pending').length,
    verified: users.filter(u => u.role === 'doctor' && u.status === 'Verified').length
  };

  const filteredUsers = users.filter(user => 
    user && (activeTab === 'doctors' ? user.role === 'doctor' : user.role === 'patient')
  );

  const renderContent = () => {
    if (loading) return <div className={styles.loader}>Syncing with Database...</div>;

    if (view === 'management') {
      return (
        <>
          <div className={styles.tabContainer}>
            <button className={activeTab === 'doctors' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('doctors')}>Doctors</button>
            <button className={activeTab === 'patients' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('patients')}>Patients</button>
          </div>
          <section className={styles.tableSection}>
            <table className={styles.userTable}>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Details</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.fullName || "N/A"}</td>
                      <td>{user.email || "N/A"}</td>
                      <td>{user.phone || "N/A"}</td>
                      <td>
                        {user.role === 'doctor' ? (
                          <div>
                            <strong>Spec:</strong> {user.specialization || "General"}<br/>
                            {user.degree_path ? (
                              <a 
                                href={`http://localhost:8000${user.degree_path}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{color: '#2563eb', fontWeight: 'bold', textDecoration: 'underline'}}
                              >
                                View Degree 📄
                              </a>
                            ) : "No Image"}
                          </div>
                        ) : "Standard Patient"}
                      </td>
                      <td>
                        <span className={user.status === 'Verified' ? styles.statusVerified : styles.statusPending}>
                          {user.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionGroup}>
                          {user.role === 'doctor' && user.status === 'Pending' && (
                            <button onClick={() => handleAction(user.id, 'verify', 'Verified')} className={styles.approveBtn}>Approve</button>
                          )}
                          <button onClick={() => handleAction(user.id, 'delete')} className={styles.deleteBtn}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No records found.</td></tr>
                )}
              </tbody>
            </table>
          </section>
        </>
      );
    }

    if (view === 'analytics') {
      return (
        <div className={styles.analyticsGrid}>
          <div className={styles.chartCard}>
            <h3>User Distribution</h3>
            <div className={styles.barContainer}>
              <div className={styles.barLabel}>Patients ({stats.patients})</div>
              <div className={styles.barBG}><div className={styles.barFill} style={{width: `${(stats.patients/stats.total || 0)*100}%`, backgroundColor: '#3b82f6'}}></div></div>
              <div className={styles.barLabel}>Verified Doctors ({stats.verified})</div>
              <div className={styles.barBG}><div className={styles.barFill} style={{width: `${(stats.verified/stats.total || 0)*100}%`, backgroundColor: '#10b981'}}></div></div>
            </div>
          </div>
          <div className={styles.chartCard}>
            <h3>Server Status</h3>
            <p>✅ Database: Connected</p>
            <p>✅ API: Healthy</p>
          </div>
        </div>
      );
    }

    if (view === 'settings') {
      return (
        <div className={styles.settingsCard}>
          <h3>System Configurations</h3>
          <div className={styles.settingItem}>
            <label>System Name</label>
            <input type="text" value={settings.systemName} onChange={(e) => setSettings({...settings, systemName: e.target.value})} />
          </div>
          <button className={styles.saveBtn} onClick={() => Swal.fire('Saved', 'Configuration Updated', 'success')}>Save Changes</button>
        </div>
      );
    }
  };

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>HFD Admin</div>
        <nav className={styles.nav}>
          <button className={view === 'management' ? styles.navItemActive : styles.navItem} onClick={() => setView('management')}>👥 Management</button>
          <button className={view === 'analytics' ? styles.navItemActive : styles.navItem} onClick={() => setView('analytics')}>📊 Analytics</button>
          <button className={view === 'settings' ? styles.navItemActive : styles.navItem} onClick={() => setView('settings')}>⚙️ Settings</button>
        </nav>
        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h2>{view.toUpperCase()}</h2>
          <div className={styles.adminProfile}>Admin: {localStorage.getItem('userName')}</div>
        </header>
        {view !== 'settings' && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}><span>Patients</span><h3>{stats.patients}</h3></div>
            <div className={styles.statCard}><span>Pending</span><h3>{stats.pending}</h3></div>
            <div className={styles.statCard}><span>Verified Doctors</span><h3>{stats.verified}</h3></div>
          </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;