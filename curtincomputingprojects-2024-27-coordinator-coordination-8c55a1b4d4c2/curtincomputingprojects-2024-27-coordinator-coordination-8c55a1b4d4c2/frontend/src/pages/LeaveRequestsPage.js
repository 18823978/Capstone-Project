import React, { useState, useEffect } from 'react';
import './LeaveRequestsPage.css';
import HeaderBar from '../components/HeaderBar';
import Button from '../components/Button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

const LeaveRequestPage = () => {
  const [courses, setCourses] = useState([]);
  const [deputies, setDeputies] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDeputy, setSelectedDeputy] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!token || !user) return;
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/courses/coordinator/${user.staff_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setCourses(res.data.data.courses || []);
    })

    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/coordinators`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setDeputies(res.data.data.coordinators || []);
    })
    .catch(err => console.error('Error fetching deputies:', err));
  }, []);

  const handleClear = () => {
    setSelectedCourse('');
    setSelectedDeputy('');
    setReason('');
    setStartDate(null);
    setEndDate(null);
  };
  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token || !selectedCourse || !selectedDeputy || !startDate || !endDate || !reason.trim()) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      const authRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const staffId = authRes.data?.data?.user?.staff_id;
      if (!staffId) throw new Error('Unable to determine coordinator ID');
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/leaves`, {
        coordinator_id: staffId,
        deputy_id: Number(selectedDeputy),
        course_code: selectedCourse,
        duties: reason.trim(),
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        is_short_leave: false
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Leave request submitted!');
      handleClear();
    } catch (err) {
      console.error('Error submitting leave request:', err);
      alert('Failed to submit leave request.');
    }
  };

  return (
    <div className="leave-request-wrapper">
      <HeaderBar showUser={true} />
      <div className="leave-request-page">
        <div className="leave-request-single-panel">
          <h2>Make New Request For Leave</h2>

          <label>Select course to go on leave</label>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
            <option value="">-- Select Course --</option>
            {courses.map(course => (
              <option key={course.course_code} value={course.course_code}>
                {course.course_code} - {course.course_name}
              </option>
            ))}
          </select>
          <label>Nominate staff to cover</label>
          <select value={selectedDeputy} onChange={(e) => setSelectedDeputy(e.target.value)}>
            <option value="">-- Select Deputy --</option>
            {deputies.map(person => (
              <option key={person.staff_id} value={person.staff_id}>
                {person.first_name} {person.last_name}
              </option>
            ))}
          </select>
          <label>Leave Period</label>
          <div className="date-range-picker">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start date"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End date"
            />
          </div>
          <label>Details</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter the reason for your leave"
          />
          <div className="button-row">
            <Button label="Submit" onClick={handleSubmit} />
            <Button label="Clear" type="button" onClick={handleClear} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default LeaveRequestPage;