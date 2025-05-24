import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';

const ParentDashboard = () => {
  const location = useLocation();
  const [kids, setKids] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const params = new URLSearchParams(location.search);
  const urlContact = params.get('contact');
  const caregiverContact = urlContact || localStorage.getItem('caregiver_contact');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!caregiverContact) {
          setError('No caregiver contact found. Please register first.');
          setLoading(false);
          return;
        }

        // Fetch rooms
        const roomsResponse = await axios.get(`${process.env.REACT_APP_SUNDAYSCHOOL_BACKEND_URL}/rooms`);
        setRooms(roomsResponse.data);

        // Fetch kids
        const kidsResponse = await axios.get(`${process.env.REACT_APP_SUNDAYSCHOOL_BACKEND_URL}/kids`, {
          params: { contact_number: caregiverContact },
        });
        setKids(kidsResponse.data);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
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

  const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => alert('Link copied to clipboard!'))
        .catch((err) => {
          console.error('Failed to copy text: ', err);
          alert('Failed to copy link. Please copy manually: ' + text);
        });
    } else {
      alert('Clipboard API not supported. Please copy manually: ' + text);
    }
  };

  const shareLink = (familyCode) => {
    const link = generateShareLink(familyCode);
    if (navigator.share) {
      navigator.share({
        title: 'Register Kid',
        text: 'Use this link to register your kid with the family code.',
        url: link,
      })
        .then(() => console.log('Link shared successfully'))
        .catch((err) => {
          console.error('Share failed:', err);
          copyToClipboard(link); // Fallback to clipboard if share fails
        });
    } else {
      copyToClipboard(link); // Fallback to clipboard if share API is not supported
    }
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
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>{kid.family_code}</td>
              <td>
                <button onClick={() => shareLink(kid.family_code)}>
                  Share Link
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