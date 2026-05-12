import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SubmitComplaint() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:5000/api/categories', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/complaints',
        { title, description, category_id: categoryId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setMessage(res.data.message);
      setTitle('');
      setDescription('');
      setCategoryId('');
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Similar complaint already exists!');
      } else {
        setError(err.response?.data?.error || 'Failed to submit');
      }
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
      <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer' }}>
        Back to Dashboard
      </button>
      <h1 style={{ color: '#2563eb' }}>Submit a Complaint</h1>
      {message && <p style={{ color: 'green', padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '6px' }}>{message}</p>}
      {error && <p style={{ color: 'red', padding: '10px', backgroundColor: '#fef2f2', borderRadius: '6px' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title</label>
          <input style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            type="text" placeholder="Brief title of your complaint"
            value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category</label>
          <select style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description</label>
          <textarea style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', height: '120px' }}
            placeholder="Describe your complaint in detail"
            value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer' }}>
          Submit Complaint
        </button>
      </form>
    </div>
  );
}

export default SubmitComplaint;