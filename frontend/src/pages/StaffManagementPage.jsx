import React, { useEffect, useState } from 'react';
import ApiService from '../services/ApiService';
import './StaffManagementPage.css';

const StaffManagementPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    role: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const data = await ApiService.getAllStaff(token);
      setStaffList(data);
    } catch {
      setError('Failed to fetch staff list');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('authToken');
      // Ensure employeeId is sent as a number
      const staffData = {
        ...form,
        employeeId: Number(form.employeeId)
      };
      await ApiService.addStaff(token, staffData);
      console.log("Staff added successfully")
      setSuccess('Staff member added successfully!');
      setForm({ firstName: '', lastName: '', email: '', employeeId: '', role: '' });
      fetchStaff();
      setShowForm(false);
    } catch (err) {
      console.log('Failed to add staff')
      setError(err.message || 'Failed to add staff member');
    }
  };

  const handleAddClick = () => {
    setShowForm(true);
    setSuccess('');
    setError('');
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm({ firstName: '', lastName: '', email: '', employeeId: '', role: '' });
    setSuccess('');
    setError('');
  };

  const handleDelete = async (staff) => {
    const name = `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || `employé #${staff.employeeId}`;
    if (!window.confirm(`Supprimer ${name} ?`)) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('authToken');
      await ApiService.deleteStaff(token, staff.id);
      setSuccess('Staff member deleted successfully!');
      fetchStaff();
    } catch (err) {
      setError(err.message || 'Failed to delete staff member');
    }
  };

  return (
    <div className="staff-admin-container">
      <h1>Gestion du staff</h1>
      <div className="staff-admin-btn-row">
        <button className="staff-admin-back-btn" onClick={() => window.location.href = '/admin'} style={{marginRight: 12}}>⬅️ Retour</button>
        <button className="staff-admin-add-btn" onClick={handleAddClick} disabled={showForm}>Ajouter Staff</button>
      </div>
      {showForm && (
        <form className="staff-admin-form" onSubmit={handleSubmit} autoComplete="off" spellCheck="false">
          <input type="text" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
          <input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input type="text" name="employeeId" placeholder="Employee ID" value={form.employeeId} onChange={handleChange} required />
          <input type="text" name="role" placeholder="Role" value={form.role} onChange={handleChange} required />
          <button type="submit">Submit</button>
          <button type="button" onClick={handleCancel}>Annuler</button>
        </form>
      )}
      {success && <div className="staff-admin-success">{success}</div>}
      {error && <div className="staff-admin-error">{error}</div>}
      <h2 style={{marginBottom: 12}}>Tous les membres du staff</h2>
      {loading ? (
        <div>Loading staff...</div>
      ) : staffList.length === 0 ? (
        <div>Aucun menbre trouvé.</div>
      ) : (
        <table className="staff-admin-table">
          <thead>
            <tr>
              <th>Prénom</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Employee ID</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff) => (
              <tr key={staff.id ?? staff.employeeId}>
                <td>{staff.firstName}</td>
                <td>{staff.lastName}</td>
                <td>{staff.email}</td>
                <td>{staff.employeeId}</td>
                <td>{staff.role}</td>
                <td>
                  <button
                    type="button"
                    className="staff-admin-delete-btn"
                    onClick={() => handleDelete(staff)}
                    disabled={!staff.id}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StaffManagementPage;
