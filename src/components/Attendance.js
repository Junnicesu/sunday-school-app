import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Attendance = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [rooms, setRooms] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch rooms on component mount
  useEffect(() => {
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

  // Fetch attendance data for the selected room and set up polling
  useEffect(() => {
    if (!roomId) return;

    const fetchAttendance = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SUNDAYSCHOOL_BACKEND_URL}/attendance/${roomId}`, { withCredentials: true });
        setAttendance(response.data);
        setError('');
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to fetch attendance');
      }
    };

    fetchAttendance();

    // Set up polling every 10 seconds
    const intervalId = setInterval(fetchAttendance, 10000);

    // Cleanup interval on component unmount or roomId change
    return () => clearInterval(intervalId);
  }, [roomId]);

  const handleRoomChange = (e) => {
    setRoomId(e.target.value);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Attendance</h2>
      <div>
        <label>Select Room: </label>
        <select value={roomId} onChange={handleRoomChange} required>
          <option value="">Select a room</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      </div>

      {roomId && (
        <div style={{ marginTop: '10px', marginBottom: '10px' }}>
          <a
            href={`${process.env.REACT_APP_SUNDAYSCHOOL_BACKEND_URL}/qr/${roomId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#007bff', textDecoration: 'underline' }}
          >
            View QR Code for Room {rooms.find((room) => room.id === parseInt(roomId))?.name || roomId}
          </a>
        </div>
      )}

      {roomId && attendance.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Kid Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Food Allergy</th>              
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Signed In By</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Signed Out By</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((kid) => (
              <tr key={kid.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{kid.kid_name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {kid.last_action === 'in' ? 'Signed In' : kid.last_action === 'out' ? 'Signed Out' : 'Not Recorded'}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{kid.food_allergy || 'None'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {kid.last_signin_caregiver_name ? (
                    <>
                      <a
                        href={`tel:${kid.last_signin_caregiver_contact || ''}`}
                        style={{ marginRight: '10px', color: '#007bff', textDecoration: 'none' }}
                      >
                        {kid.last_signin_caregiver_name}
                      </a>
                      <a
                        href={`sms:${kid.last_signin_caregiver_contact || ''}`}
                        style={{ color: '#007bff', textDecoration: 'none' }}
                      >
                        [...]
                      </a>
                    </>
                  ) : kid.last_caregiver_name ? (
                    <>
                      <a
                        href={`tel:${kid.caregiver_contact || ''}`}
                        style={{ marginRight: '10px', color: '#007bff', textDecoration: 'none' }}
                      >
                        {kid.last_caregiver_name}
                      </a>
                      <a
                        href={`sms:${kid.caregiver_contact || ''}`}
                        style={{ color: '#007bff', textDecoration: 'none' }}
                      >
                        [...]
                      </a>
                    </>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {kid.last_signout_caregiver_name ? (
                    <>
                      <a
                        href={`tel:${kid.last_signout_caregiver_contact || ''}`}
                        style={{ marginRight: '10px', color: '#007bff', textDecoration: 'none' }}
                      >
                        {kid.last_signout_caregiver_name}
                      </a>
                      <a
                        href={`sms:${kid.last_signout_caregiver_contact || ''}`}
                        style={{ color: '#007bff', textDecoration: 'none' }}
                      >
                        [...]
                      </a>
                    </>
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : roomId ? (
        <p>No kids found for this room.</p>
      ) : null}
    </div>
  );
};

export default Attendance;