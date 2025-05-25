import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';

const ParentRegister = () => {
  const location = useLocation();
  const [caregiverName, setCaregiverName] = useState('');
  const [caregiverContact, setCaregiverContact] = useState('');
  const [kidName, setKidName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [hasAllergy, setHasAllergy] = useState(false);
  const [allergyDetails, setAllergyDetails] = useState('');
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const familyCodeParam = params.get('family_code');
    if (familyCodeParam) {
      setFamilyCode(familyCodeParam);
      setIsLinking(true);
    }

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
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const foodAllergy = hasAllergy ? allergyDetails : null;

    try {
      const response = await axios.post(`${process.env.REACT_APP_SUNDAYSCHOOL_BACKEND_URL}/register`, {
        caregiver_name: caregiverName,
        caregiver_contact: caregiverContact,
        kid_name: kidName,
        room_id: roomId,
        family_code: familyCode,
        food_allergy: foodAllergy,
      });

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
      setHasAllergy(false);
      setAllergyDetails('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
    }
  };

  const storedCaregiverContact = localStorage.getItem('caregiver_contact');
  const showDashboardLink = caregiverContact || storedCaregiverContact;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Parent Registration</h2>
      {showDashboardLink && (
        <Link
          to={
            caregiverContact
              ? `/parent/dashboard?contact=${encodeURIComponent(caregiverContact)}`
              : '/parent/dashboard'
          }
        >
          Go to Dashboard with number: {caregiverContact || storedCaregiverContact}
        </Link>
      )}
      <div>
        <label>Caregiver Name:</label>
        <input
          type="text"
          value={caregiverName}
          onChange={(e) => setCaregiverName(e.target.value)}
          placeholder="(e.g., John Doe)"
          required
        />
      </div>
      <div>
        <label>Caregiver Contact:</label>
        <input
          type="text"
          value={caregiverContact}
          onChange={(e) => setCaregiverContact(e.target.value)}
          placeholder="(e.g., 1234567890)"
          required
        />
      </div>
      <div>
        <label>Kid Name:</label>
        <input
          type="text"
          value={kidName}
          onChange={(e) => setKidName(e.target.value)}
          placeholder="(e.g., Jane Doe)"
          disabled={isLinking}
          required
        />
      </div>
      <div>
        <label>Room:</label>
        <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          disabled={isLinking}
          required={!isLinking}
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
        <label>Family Code (if linking):</label>
        <input
          type="text"
          value={familyCode}
          onChange={(e) => setFamilyCode(e.target.value)}
          placeholder="(e.g., 45b16c2e)"
          disabled={roomId !== ''}
        />
      </div>
      <div>
        <label>Food Allergy:</label>
        <select value={hasAllergy ? 'Yes' : 'No'} onChange={(e) => setHasAllergy(e.target.value === 'Yes')} disabled={isLinking}>
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
        {hasAllergy && (
          <input
            type="text"
            value={allergyDetails}
            onChange={(e) => setAllergyDetails(e.target.value)}
            placeholder="Specify allergy (e.g., Peanuts, Dairy)"
            required
          />
        )}
      </div>
      <button onClick={handleSubmit}>Register</button>
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ParentRegister;