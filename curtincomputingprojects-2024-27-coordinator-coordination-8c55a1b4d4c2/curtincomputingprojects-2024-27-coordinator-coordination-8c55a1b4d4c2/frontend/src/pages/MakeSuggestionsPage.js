import React, { useEffect, useState } from 'react';
import './MakeSuggestionsPage.css';
import HeaderBar from '../components/HeaderBar';
import MakeSuggestionForm from '../components/MakeSuggestionForm';
import axios from 'axios';

const MakeSuggestionsPage = () => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!token || !currentUser) return;
    
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/suggestions/coordinator/${currentUser.staff_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        setSuggestions(res.data?.data?.suggestions || []);
      })
      .catch(err => console.error('Error fetching suggestions:', err));
  }, []);

  return (
    <div className="make-suggestions-page">
      <HeaderBar showUser={true} />
      <div className="make-suggestions-content">
        <div className="suggestion-history">
          <h2>My Suggestions</h2>
          {suggestions.length === 0 ? (
            <p>No suggestions found.</p>
          ) : (
            <div className="suggestion-scroll">
              {suggestions.map((s) => (
                <div key={s.id} className="suggestion-card">
                  <div className="suggestion-header">
                    <span>Suggestion #{s.id}</span>
                  </div>
                  <div className="suggestion-meta">
                    Submitted at: {new Date(s.submitted_at).toLocaleString()}
                  </div>
                  <div className="suggestion-desc">
                    {s.suggestion_text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <MakeSuggestionForm
          onSubmit={(newSuggestion) => {
            setSuggestions(prev => [...prev, newSuggestion]);
          }}
        />
      </div>
    </div>
  );
};
export default MakeSuggestionsPage;