import React, { useState } from 'react';
import './MakeSuggestionForm.css';
import Button from './Button';
import axios from 'axios';

const MakeSuggestionForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Please fill in both fields before submitting.');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to submit a suggestion.');
      return;
    }
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/suggestions`, {
      suggestion_text: `[${title}] ${description}`,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        onSubmit(res.data);
        setTitle('');
        setDescription('');
      })
      .catch((err) => {
        console.error('Failed to submit suggestion:', err);
        alert('Submission failed. Please try again.');
      });
  };

  return (
    <div className="make-suggestion-form">
      <h2>Make New Suggestion</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Issue</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your suggestion title"
        />
        <label htmlFor="description">Details</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide detailed explanation"
        />
        <div className="button-group">
          <Button label="Submit" type="submit" />
          <Button label="Clear" type="button" onClick={() => {
            setTitle('');
            setDescription('');
          }} />
        </div>
      </form>
    </div>
  );
};
export default MakeSuggestionForm;