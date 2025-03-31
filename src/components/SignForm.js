import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';

const SignForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const kidId = new URLSearchParams(location.search).get('kid_id');
  const [action, setAction] = useState('in');

  const handleScan = async (data) => {
    if (data) {
      const roomId = data.split(':')[1];
      try {
        await axios.post('http://localhost:3000/sign', { kid_id: kidId, room_id: roomId, action });
        alert(`Kid successfully signed ${action === 'in' ? 'in' : 'out'}`);
        navigate('/parent/dashboard');
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to record action');
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    alert('Error accessing camera');
  };

  return (
    <div>
      <h2>Sign Kid {action === 'in' ? 'In' : 'Out'}</h2>
      <div>
        <label>Action:</label>
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="in">Sign In</option>
          <option value="out">Sign Out</option>
        </select>
      </div>
      <QrReader
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: '100%', maxWidth: '300px' }}
      />
    </div>
  );
};

export default SignForm;
