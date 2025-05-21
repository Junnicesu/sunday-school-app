import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ParentRegister = () => {
  const [caregiverName, setCaregiverName] = useState('');
  const [caregiverContact, setCaregiverContact] = useState('');
  const [kidName, setKidName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Load caregiver data from localStorage on component mount
  useEffect(() => {
    const storedCaregiverName = localStorage.getItem('caregiver_name');
    const storedCaregiverContact = localStorage.getItem('caregiver_contact');
    if (storedCaregiverName) {
      setCaregiverName(storedCaregiverName);
    }
    if (storedCaregiverContact) {
      setCaregiverContact(storedCaregiverContact);
    }

    // Fetch rooms from backend
    axios
      .get(`${process.env.REACT_APP_SUNDAYSCHOOL_BACKEND_URL}/rooms`)
      .then((response) => {
        setRooms(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.response?.data?.error || 'Failed to fetch rooms');
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_SUNDAYSCHOOL_BACKEND_URL}/register`, {
        caregiver_name: caregiverName,
        caregiver_contact: caregiverContact,
        kid_name: kidName,
        room_id: roomId,
        family_code: familyCode,
      });

      // Save caregiver info to localStorage
      localStorage.setItem('caregiver_contact', caregiverContact);
      localStorage.setItem('caregiver_name', caregiverName);
      if (response.data.family_code) {
        localStorage.setItem('family_code', response.data.family_code);
      }

      setSuccess(response.data.message || 'Registration successful!');
      // Reset kid-related fields but keep caregiver info
      setKidName('');
      setRoomId('');
      setFamilyCode('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
          <label>Caregiver Contact:</label>
          <input
            type="text"
            value={caregiverContact}
            onChange={(e) => setCaregiverContact(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Kid Name:</label>
          <input
            type="text"
            value={kidName}
            onChange={(e) => setKidName(e.target.value)}
          />
        </div>
        <div>
          <label>Room:</label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
          >
            <option value="">Select a room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Family Code (if linking to existing kid):</label>
          <input
            type="text"
            value={familyCode}
            onChange={(e) => setFamilyCode(e.target.value)}
          />
        </div>
        <button type="submit">Register</button>
      </form>
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ParentRegister;