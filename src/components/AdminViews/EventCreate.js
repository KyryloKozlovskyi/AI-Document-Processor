import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EventCreate = () => {

    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        courseName: '',
        venue: '',
        date: '',
        price: '',
        emailText: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/events', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Event created successfully:', response.data);
            // redirect to admin page
            navigate('/admin');
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    return (
        <div className="container mt-4">
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                <div className="mb-3">
                    <label className="form-label">Course Name:</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        name="courseName" 
                        value={formData.courseName} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Venue:</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        name="venue" 
                        value={formData.venue} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Date:</label>
                    <input 
                        type="date" 
                        className="form-control" 
                        name="date" 
                        value={formData.date} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Price:</label>
                    <input 
                        type="number" 
                        className="form-control" 
                        name="price" 
                        value={formData.price} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Email Text:</label>
                    <textarea 
                        className="form-control" 
                        name="emailText" 
                        value={formData.emailText} 
                        onChange={handleChange} 
                        required
                        rows="4"
                    ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">Create Event</button>
            </form>
        </div>
    );
};

export default EventCreate;