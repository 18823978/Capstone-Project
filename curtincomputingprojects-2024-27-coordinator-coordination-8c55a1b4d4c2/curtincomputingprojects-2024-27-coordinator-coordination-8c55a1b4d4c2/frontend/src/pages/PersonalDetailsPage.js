import React, { useEffect, useState } from 'react';
import './PersonalDetailsPage.css';
import HeaderBar from '../components/HeaderBar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PersonalDetailsPage = () => {
  const [details, setDetails] = useState({
    name: '',
    phone: '',
    email: '',
    responsibilities: [],
    schedule: [],
  });
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const token = localStorage.getItem('token');
    
    if (!user || !token) return;
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        const user = res.data?.data?.user;
        const courses = res.data?.data?.courses || [];
        if (!user) {
          throw new Error("No user data returned from backend.");
        }
        const { first_name, last_name, phone, email } = user;
        const schedule = courses.flatMap(course =>
          course.components.map(comp => ({
            course: `${course.course_code} - ${course.course_name}`,
            room: comp.name,      
            time: comp.schedule,   
            day: comp.schedule.split(' ')[0],
          }))
        );
        setDetails({
          name: `${first_name} ${last_name}`,
          phone,
          email,
          responsibilities: courses.map(c => `${c.course_code} - ${c.course_name}`),
          schedule,
        });
      })
      .catch(err => console.error('Failed to fetch coordinator details:', err));
  }, []);

  return (
    <div className="page-wrapper">
      <HeaderBar showUser={true} />
      <div className="personal-details-page">
        <div className="profile-section">
          <div className="basic-info">
            <div className="info-block">Name: {details.name}</div>
            <div className="info-block">Phone Number: {details.phone}</div>
            <div className="info-block">Email Address: {details.email}</div>
          </div>
        </div>
        <div className="info-section-container">
          <div className="info-section">
            <h2>Course Responsibilities:</h2>
            <div className="info-boxes">
              {details.responsibilities.map((item, idx) => (
                <div key={idx} className="info-box">{item}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="time-section">
          <h2>Weekly Schedule</h2>
          <div className="time-grid">
            {details.schedule.map((slot, idx) => (
              <div key={idx} className="time-slot">
                <strong>{slot.day}</strong>
                <div>{slot.course}</div>
                <div>{slot.room}</div>
                <div>{slot.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default PersonalDetailsPage;