import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const RoomPage = () => {
    const { roomId } = useParams(); // Get room_id from URL
    const [caregiverContact, setCaregiverContact] = useState(localStorage.getItem('caregiver_contact') || '');
    const [kids, setKids] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Prompt for contact if not in local storage
        if (!caregiverContact) {
            const contact = prompt('Please enter your contact number:');
            if (contact) {
                setCaregiverContact(contact);
                localStorage.setItem('caregiver_contact', contact);
            } else {
                alert('Contact number is required.');
                return;
            }
        }

        // Fetch kids for this caregiver and room
        axios.get('http://localhost:3000/kids-for-room', {
            params: { contact_number: caregiverContact, room_id: roomId }
        })
        .then(response => {
            setKids(response.data);
            setLoading(false);
        })
        .catch(error => {
            console.error('Error fetching kids:', error);
            setLoading(false);
        });
    }, [roomId, caregiverContact]);

    const handleSign = async (kidId, action) => {
        try {
            await axios.post('http://localhost:3000/sign', { kid_id: kidId, room_id: roomId, action });
            alert(`Kid successfully signed ${action}`);
            // Refresh the list
            const response = await axios.get('http://localhost:3000/kids-for-room', {
                params: { contact_number: caregiverContact, room_id: roomId }
            });
            setKids(response.data);
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to record action');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2>Room {roomId}</h2>
            {kids.map(kid => (
                <div key={kid.id}>
                    {kid.name} - Status: {kid.last_action || 'Not signed in'}
                    <button onClick={() => handleSign(kid.id, kid.last_action === 'in' ? 'out' : 'in')}>
                        {kid.last_action === 'in' ? 'Sign Out' : 'Sign In'}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default RoomPage;