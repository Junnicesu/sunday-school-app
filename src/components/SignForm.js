import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignForm = () => {
  const navigate = useNavigate();
  const caregiverContact = localStorage.getItem('caregiver_contact');
  const [roomId, setRoomId] = useState('');
  const [kids, setKids] = useState([]);
  const [selectedKids, setSelectedKids] = useState([]);
  const [action, setAction] = useState('in');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!caregiverContact) {
      alert('Please register first.');
      navigate('/parent/register');
      return;
    }

    // Fetch rooms and kids (example)
    axios
      .get(`${process.env.REACT_APP_SUNDAYSCHOOL_BACKEND_URL}/kids`, {
        params: { contact_number: caregiverContact },
      })
      .then((response) => {
        setKids(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.response?.data?.error || 'Failed to fetch kids');
        setLoading(false);
      });
  }, [caregiverContact, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomId || selectedKids.length === 0) {
      setError('Please select a room and at least one kid.');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_SUNDAYSCHOOL_BACKEND_URL}/sign`, {
        caregiver_contact: caregiverContact,
        room_id: roomId,
        kid_ids: selectedKids,
        action,
      });
      alert(response.data.message);
      setSelectedKids([]);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to sign in/out');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Sign In/Out</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Room ID:</label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Kids:</label>
          {kids.map((kid) => (
            <div key={kid.id}>
              <input
                type="checkbox"
                value={kid.id}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedKids([...selectedKids, kid.id]);
                  } else {
                    setSelectedKids(selectedKids.filter((id) => id !== kid.id));
                  }
                }}
              />
              {kid.name} (Room: {kid.room_name})
            </div>
          ))}
        </div>
        <div>
          <label>Action:</label>
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="in">Sign In</option>
            <option value="out">Sign Out</option>
          </select>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default SignForm;