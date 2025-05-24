import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';

const ParentDashboard = () => {
    const location = useLocation();
    const [kids, setKids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const params = new URLSearchParams(location.search);
    const urlContact = params.get('contact');
    const caregiverContact = urlContact || localStorage.getItem('caregiver_contact');

  useEffect(() => {
    if (!caregiverContact) {
      setError('No caregiver contact found. Please register first.');
      setLoading(false);
      return;
    }

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
  }, [caregiverContact]);

  const handleRoomChange = async (kidId, newRoomId) => {
    try {
      await axios.put(`${process.env.REACT_APP_SUNDAYSCHOOL_BACKEND_URL}/kids/${kidId}/room`, {
        room_id: newRoomId,
      });
      setKids(kids.map((kid) => (kid.id === kidId ? { ...kid, room_id: newRoomId } : kid)));
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update room');
    }
  };

  const generateShareLink = (familyCode) => {
    return `${window.location.origin}/parent/register?family_code=${familyCode}`;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Parent Dashboard</h2>
      <table>
        <thead>
          <tr>
            <th>Kid Name</th>
            <th>Registered Room</th>
            <th>Family Code</th>
            <th>Share</th>
          </tr>
        </thead>
        <tbody>
          {kids.map((kid) => (
            <tr key={kid.id}>
              <td>{kid.name}</td>
              <td>
                <select
                  value={kid.room_id}
                  onChange={(e) => handleRoomChange(kid.id, e.target.value)}
                >
                  {/* Replace with actual room options from API */}
                  <option value="1">Room 1</option>
                  <option value="2">Room 2</option>
                  <option value="3">Room 3</option>
                </select>
              </td>
              <td>{kid.family_code}</td>
              <td>
                <button
                  onClick={() => navigator.clipboard.writeText(generateShareLink(kid.family_code))}
                >
                  Copy Share Link
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ParentDashboard;