import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ParentDashboard = () => {
  const [contactNumber, setContactNumber] = useState('');
  const [kids, setKids] = useState([]);
  const navigate = useNavigate();

  const fetchKids = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/kids?contact_number=${contactNumber}`);
      setKids(response.data);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to fetch kids');
    }
  };

  const handleSign = (kidId) => {
    navigate(`/parent/sign?kid_id=${kidId}`);
  };

  return (
    <div>
      <h2>Parent Dashboard</h2>
      <div>
        <label>Enter Your Contact Number:</label>
        <input
          type="text"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
        />
        <button onClick={fetchKids}>Load Kids</button>
      </div>
      {kids.length > 0 && (
        <ul>
          {kids.map((kid) => (
            <li key={kid.id}>
              {kid.name} <button onClick={() => handleSign(kid.id)}>Sign In/Out</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ParentDashboard;
