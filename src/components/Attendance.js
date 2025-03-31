import React, { useState } from 'react';
import axios from 'axios';

const Attendance = () => {
  const [roomId, setRoomId] = useState('1');
  const [attendance, setAttendance] = useState([]);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/attendance/${roomId}`, { withCredentials: true });
      setAttendance(response.data);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to fetch attendance');
    }
  };

  return (
    <div>
      <h2>Attendance</h2>
      <div>
        <label>Select Room:</label>
        <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
          <option value="1">Room A</option>
          <option value="2">Room B</option>
        </select>
        <button onClick={fetchAttendance}>Load Attendance</button>
      </div>
      {attendance.length > 0 ? (
        <ul>
          {attendance.map((kid) => (
            <li key={kid.id}>{kid.name}</li>
          ))}
        </ul>
      ) : (
        <p>No kids currently signed in.</p>
      )}
      <div>
        <a href={`http://localhost:3000/qr/${roomId}`} target="_blank" rel="noopener noreferrer">
          Generate and Print QR Code for Room {roomId}
        </a>
      </div>
    </div>
  );
};

export default Attendance;
