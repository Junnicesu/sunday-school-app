import React, { useState } from 'react';
import axios from 'axios';

const ParentRegister = () => {
  const [caregiverName, setCaregiverName] = useState('');
  const [caregiverContact, setCaregiverContact] = useState('');
  const [kidName, setKidName] = useState('');
  const [familyCode, setFamilyCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/register', {
        caregiver_name: caregiverName,
        caregiver_contact: caregiverContact,
        kid_name: kidName,
        family_code: familyCode,
      });
      if (response.data.family_code) {
        alert(`Registration successful! Share this family code with other caregivers: ${response.data.family_code}`);
      } else {
        alert('Successfully linked to existing kid!');
      }
      setCaregiverName('');
      setCaregiverContact('');
      setKidName('');
      setFamilyCode('');
    } catch (error) {
      alert(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div>
      <h2>Parent Registration</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Caregiver Name:</label>
          <input
            type="text"
            value={caregiverName}
            onChange={(e) => setCaregiverName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contact Number:</label>
          <input
            type="text"
            value={caregiverContact}
            onChange={(e) => setCaregiverContact(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Kid Name (leave blank if linking):</label>
          <input
            type="text"
            value={kidName}
            onChange={(e) => setKidName(e.target.value)}
            disabled={familyCode !== ''}
          />
        </div>
        <div>
          <label>Family Code (if linking to existing kid):</label>
          <input
            type="text"
            value={familyCode}
            onChange={(e) => setFamilyCode(e.target.value)}
            disabled={kidName !== ''}
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default ParentRegister;
