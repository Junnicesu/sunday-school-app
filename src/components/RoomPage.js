import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const caregiverContact = localStorage.getItem('caregiver_contact');
  const [kids, setKids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect to registration if caregiver_contact is not in localStorage
    if (!caregiverContact) {
      alert('Please register first.');
      navigate('/parent/register');
      return;
    }

    // Fetch kids for this room and caregiver
    axios
      .get(`${process.env.REACT_APP_SUNDAYSCHOOL_BACKEND_URL}/kids-for-room`, {
        params: { contact_number: caregiverContact, room_id: roomId },
      })
      .then((response) => {
        setKids(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.response?.data?.error || 'Failed to fetch kids');
        setLoading(false);
      });
  }, [roomId, caregiverContact, navigate]);

  const handleSign = async (kidId, action) => {
    try {
      await axios.post(`${process.env.REACT_APP_SUNDAYSCHOOL_BACKEND_URL}/sign`, {
        caregiver_contact: caregiverContact, // Include caregiver_contact
        room_id: roomId,
        kid_ids: [kidId], // Send as array to match backend expectation
        action,
      });
      alert(`Kid successfully signed ${action}`);
      // Refresh the kids list
      const response = await axios.get(`${process.env.REACT_APP_SUNDAYSCHOOL_BACKEND_URL}/kids-for-room`, {
        params: { contact_number: caregiverContact, room_id: roomId },
      });
      setKids(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to record action');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Room {roomId}</h2>
      {kids.map((kid) => (
        <div key={kid.id}>
          {kid.name} - Status: {kid.last_action || 'Not signed in'}
          <button
            onClick={() => handleSign(kid.id, kid.last_action === 'in' ? 'out' : 'in')}
          >
            {kid.last_action === 'in' ? 'Sign Out' : 'Sign In'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default RoomPage;