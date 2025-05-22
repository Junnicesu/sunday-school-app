import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import { QrReader } from 'react-qr-reader';

const ParentDashboard = () => {
    const [contactNumber, setContactNumber] = useState(localStorage.getItem('contactNumber') || '');
    const [kids, setKids] = useState([]);
    const [qrData, setQrData] = useState(null); // Holds QR code data after scan
    const [roomKids, setRoomKids] = useState([]); // Kids for the scanned room
    const [selectedKids, setSelectedKids] = useState([]); // IDs of kids to sign in/out
    const [feedback, setFeedback] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (contactNumber) {
            localStorage.setItem('contactNumber', contactNumber);
            fetchKids();
        }
    }, [contactNumber]);

    const fetchKids = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_SUNDAYSCHOOL_BACKEND_URL}/kids?contact_number=${contactNumber}`);
            setKids(response.data);
        } catch (error) {
            if (error.response?.status === 404) {
                navigate('/parent/register');
            } else {
                alert(error.response?.data?.error || 'Failed to fetch kids');
            }
        }
    };

    const handleScan = async (data) => {
        if (data && !qrData) {
            const [_, roomId, __, action] = data.split(':'); // e.g., "room:1:action:in"
            setQrData({ room_id: roomId, action });
            try {
                const response = await axios.get(`${process.env.REACT_APP_SUNDAYSCHOOL_BACKEND_URL}/kids-for-room`, {
                    params: { contact_number: contactNumber, room_id: roomId }
                });
                setRoomKids(response.data);
            } catch (error) {
                setFeedback(error.response?.data?.error || 'Failed to fetch kids for room');
            }
        }
    };

    const handleError = (err) => {
        console.error(err);
        setFeedback('Error accessing camera');
    };

    const toggleKidSelection = (kidId) => {
        setSelectedKids(prev =>
            prev.includes(kidId) ? prev.filter(id => id !== kidId) : [...prev, kidId]
        );
    };

    const handleSignSubmit = async () => {
        if (selectedKids.length === 0) {
            setFeedback('Please select at least one kid');
            return;
        }
        try {
            const response = await axios.post(`${process.env.REACT_APP_SUNDAYSCHOOL_BACKEND_URL}/sign`, {
                caregiver_contact: contactNumber,
                room_id: qrData.room_id,
                kid_ids: selectedKids,
                action: qrData.action
            });
            setFeedback(response.data.message);
            setQrData(null); // Reset after submission
            setRoomKids([]);
            setSelectedKids([]);
            fetchKids(); // Refresh kid list
        } catch (error) {
            setFeedback(error.response?.data?.error || 'Failed to record action');
        }
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
                            {kid.name} - Room: {kid.room_name}
                        </li>
                    ))}
                </ul>
            )}
            <h3>Scan Room QR Code</h3>
            {qrData && roomKids.length > 0 && (
                <div>
                    <h4>Select Kids to Sign {qrData.action === 'in' ? 'In' : 'Out'} of {roomKids[0].room_name}</h4>
                    {roomKids.map(kid => (
                        <div key={kid.id}>
                            <input
                                type="checkbox"
                                checked={selectedKids.includes(kid.id)}
                                onChange={() => toggleKidSelection(kid.id)}
                                disabled={kid.last_action === qrData.action} // Disable if already in that state
                            />
                            <label>
                                {kid.name} (Currently: {kid.last_action || 'out'})
                            </label>
                        </div>
                    ))}
                    <button onClick={handleSignSubmit}>Confirm</button>
                    <button onClick={() => { setQrData(null); setRoomKids([]); setSelectedKids([]); }}>Cancel</button>
                </div>
            )}
            {feedback && (
                <div>
                    <h4>Result:</h4>
                    <p>{feedback}</p>
                </div>
            )}
        </div>
    );
};

export default ParentDashboard;
