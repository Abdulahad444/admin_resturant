import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Check, X, AlertCircle, ArrowDown, User } from 'lucide-react';

export default function FeedbackManagement() {
  const responseRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseForm, setResponseForm] = useState({
    response: '',
    implementationStatus: 'notdone',
    implementationComment: '',
    suggestion: ''
  });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/feedback');
      if (!response.ok) throw new Error('Failed to fetch feedbacks');
      const { feedbacks } = await response.json();
      setFeedbacks(feedbacks);
    } catch (error) {
      showAlert(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (feedback) => {
    setSelectedFeedback(feedback);
    setResponseForm(prev => ({
      ...prev,
      implementationStatus: feedback.implementationStatus || 'notdone',
      implementationComment: feedback.implementationComment || '',
      suggestion: feedback.suggestion || ''
    }));
    setTimeout(() => {
      responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleResponse = async (e) => {
    e.preventDefault();
    if (!selectedFeedback) return;
  
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/feedback/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId: selectedFeedback._id,
          response: responseForm.response
        }),
      });
  
      if (!response.ok) throw new Error('Failed to submit response');
  
      const data = await response.json();
      setFeedbacks(prev => prev.map(f => 
        f._id === selectedFeedback._id ? data.feedback : f
      ));
      showAlert('Response submitted successfully', 'success');
      setSelectedFeedback(null);
      resetForm();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      showAlert(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleImplementation = async (e) => {
    e.preventDefault();
    if (!selectedFeedback) return;
  
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/feedback/suggestion/implemen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId: selectedFeedback._id,
          implementationStatus: responseForm.implementationStatus,
          implementationComment: responseForm.implementationComment,
          suggestion: responseForm.suggestion || selectedFeedback.suggestion
        }),
      });
  
      if (!response.ok) throw new Error('Failed to update implementation status');
  
      const data = await response.json();
      setFeedbacks(prev => prev.map(f => 
        f._id === selectedFeedback._id ? data.feedback : f
      ));
      showAlert('Implementation status updated successfully', 'success');
      setSelectedFeedback(null);
      resetForm();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      showAlert(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setResponseForm({
      response: '',
      implementationStatus: 'notdone',
      implementationComment: '',
      suggestion: ''
    });
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} style={{ color: index < rating ? '#ffd700' : '#666' }}>★</span>
    ));
  };

  return (
    <>
      <style>
        {`
        html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}
        // Add these styles to your existing styles
.dashboard-header {
  text-align: center;
  padding: 2rem;
  position: relative;
  margin-bottom: 2rem;
}

.dashboard-title {
  text-align: center;
  font-size: 48px;
  font-weight: 800;
  color: #ff4757;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 4px 10px rgba(255, 71, 87, 0.3);
  margin-bottom: 0.5rem;
}

.dashboard-subtitle {
  font-size: 18px;
  color: #a0aec0;
  font-weight: 500;
}
          .feedback-container {
            min-height: 100vh;
                 background: #121721;
            padding: 32px;
            color: #ffffff;
          }

          .notification-header {
            text-align: center;
            margin-bottom: 32px;
          }

          .notification-title {
            text-align: center;
            font-size: 30px;
            color: #cbd5e0;
            margin-bottom: 30px;
            font-weight: 700;
            position: relative;
            text-transform: uppercase;
            letter-spacing: 2px;
          }

          .notification-title::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 4px;
            background: linear-gradient(to right, transparent, #ff4757, transparent);
          }

          .gradient-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(31, 38, 49, 0.9) 0%, rgba(26, 32, 44, 0.95) 100%);
            pointer-events: none;
            z-index: -1;
            animation: gradientShift 15s ease infinite;
          }

          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .alert {
            margin-bottom: 24px;
            padding: 16px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
          }

          .alert.success { background-color: rgba(6, 78, 59, 0.5); }
          .alert.error { background-color: rgba(153, 27, 27, 0.5); }

          .card {
            background-color: #1f2937;
            padding: 24px;
            border-radius: 8px;
            border: 1px solid #374151;
            margin-bottom: 32px;
            transition: all 0.3s ease;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          }

          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
            border-color: rgba(239, 68, 68, 0.3);
          }

          .feedback-item {
            position: relative;
            padding: 20px;
            background-color: rgba(55, 65, 81, 0.5);
            border-radius: 8px;
            margin-bottom: 16px;
            transition: all 0.3s ease;
            cursor: pointer;
            border: 1px solid transparent;
            overflow: hidden;
          }

          .feedback-item:hover {
            transform: translateX(10px);
            background-color: rgba(55, 65, 81, 0.8);
            border-color: rgba(239, 68, 68, 0.3);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          }

          .feedback-item:hover .scroll-indicator {
            opacity: 1;
            transform: translateY(0);
          }

          .scroll-indicator {
            position: absolute;
            right: 16px;
            bottom: 16px;
            color: #ff4757;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
          }

          .feedback-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }

          .feedback-rating {
            font-size: 20px;
          }

          .feedback-content {
            color: #e5e7eb;
            margin-bottom: 12px;
            line-height: 1.5;
          }

          .suggestion-box {
            background-color: rgba(55, 65, 81, 0.3);
            padding: 16px;
            border-radius: 6px;
            margin-top: 12px;
            transition: all 0.3s ease;
          }

          .suggestion-box:hover {
            background-color: rgba(55, 65, 81, 0.4);
          }

          .implementation-details {
            margin-top: 16px;
            padding: 16px;
            background-color: rgba(55, 65, 81, 0.3);
            border-radius: 6px;
          }

          .details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-top: 16px;
          }

          .details-item {
            background-color: rgba(55, 65, 81, 0.5);
            padding: 12px;
            border-radius: 6px;
            transition: all 0.3s ease;
          }

          .details-item:hover {
            background-color: rgba(55, 65, 81, 0.7);
          }

          .details-label {
            font-size: 12px;
            color: #9ca3af;
            margin-bottom: 4px;
          }

          .details-value {
            font-size: 14px;
            color: #e5e7eb;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-label {
            display: block;
            margin-bottom: 8px;
            color: #e5e7eb;
          }

          .form-input {
            width: 100%;
            padding: 12px;
            background-color: #374151;
            border: 1px solid #4b5563;
            border-radius: 6px;
            color: #e5e7eb;
            transition: all 0.3s ease;
          }

          .form-input:focus {
            border-color: #ff4757;
            outline: none;
            box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
          }

          .submit-button {
            background-color: #ff4757;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2);
          }

          .submit-button:hover:not(:disabled) {
            background-color: #ff5f6d;
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(239, 68, 68, 0.3);
          }

          .submit-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .status-badge.status-done {
            background-color: rgba(6, 78, 59, 0.5);
            color: #34d399;
          }

          .status-badge.status-notdone {
            background-color: rgba(153, 27, 27, 0.5);
            color: #ef4444;
          }

          @media (max-width: 768px) {
            .feedback-container {
              padding: 16px;
            }

            .details-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="gradient-overlay" />
      <div className="feedback-container">
      <div className="dashboard-header">
    <h1 className="dashboard-title">Feedback Dashboard</h1>
  </div>
        <div className="notification-header">
          <h1 className="notification-title">Feedback Management</h1>
        </div>

        {alert.show && (
          <div className={`alert ${alert.type}`}>
            <AlertCircle size={20} />
            <span>{alert.message}</span>
          </div>
        )}

        <div className="card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
          ) : feedbacks.length > 0 ? (
            feedbacks.map((feedback) => (
              <div 
                key={feedback._id} 
                className="feedback-item"
                onClick={() => handleCardClick(feedback)}
              >
                <div className="feedback-header">
                  <div className="feedback-rating">
                    {renderStars(feedback.rating)}
                  </div>
                  <div className="status-badge status-done">
                    {feedback.customer?.name || 'Anonymous'}
                  </div>
                </div>
                <div className="feedback-content">{feedback.comment}</div>
                {feedback.suggestion && (
                  <div className="suggestion-box">
                    <strong>Suggestion: </strong>
                    {feedback.suggestion}
                    <div style={{ marginTop: '8px' }}>
                      <span className={`status-badge ${feedback.implementationStatus === 'done' ? 'status-done' : 'status-notdone'}`}>
                        {feedback.implementationStatus === 'done' ? 'Implemented' : 'Pending'}
                      </span>
                    </div>
                    {feedback.implementationComment && (
                      <div className="implementation-details">
                        <strong>Implementation Details:</strong>
                        <p>{feedback.implementationComment}</p>
                      </div>
                    )}
                  </div>
                )}
                {feedback.response && (
                  <div className="feedback-meta">
                    <strong>Response: </strong>{feedback.response}
                  </div>
                )}
                <div className="scroll-indicator">
                  <ArrowDown size={20} />
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>No feedbacks found</div>
          )}
        </div>{selectedFeedback && (
          <div className="card" ref={responseRef}>
            <h2 style={{ marginBottom: '20px', color: '#ff4757' }}>Respond to Feedback</h2>
            <div className="implementation-details">
              <h3 style={{ marginBottom: '12px', color: '#ff4757' }}>Selected Feedback Details</h3>
              <div className="details-grid">
                <div className="details-item">
                  <div className="details-label">Customer</div>
                  <div className="details-value">{selectedFeedback.customer?.name || 'Anonymous'}</div>
                </div>
                <div className="details-item">
                  <div className="details-label">Rating</div>
                  <div className="details-value">{renderStars(selectedFeedback.rating)}</div>
                </div>
                <div className="details-item">
                  <div className="details-label">Status</div>
                  <div className="details-value">
                    <span className={`status-badge ${selectedFeedback.implementationStatus === 'done' ? 'status-done' : 'status-notdone'}`}>
                      {selectedFeedback.implementationStatus === 'done' ? 'Implemented' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleResponse} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label className="form-label">Your Response</label>
                <textarea
                  className="form-input"
                  value={responseForm.response}
                  onChange={(e) => setResponseForm(prev => ({ ...prev, response: e.target.value }))}
                  rows="4"
                  required
                />
              </div>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Sending...' : 'Submit Response'}
              </button>
            </form>

            {selectedFeedback.suggestion && (
              <form onSubmit={handleImplementation} style={{ marginTop: '32px' }}>
                <h3 style={{ marginBottom: '20px', color: '#ff4757' }}>Update Implementation Status</h3>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={responseForm.implementationStatus}
                    onChange={(e) => setResponseForm(prev => ({ ...prev, implementationStatus: e.target.value }))}
                    required
                  >
                    <option value="notdone">Not Implemented</option>
                    <option value="done">Implemented</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Implementation Comment</label>
                  <textarea
                    className="form-input"
                    value={responseForm.implementationComment}
                    onChange={(e) => setResponseForm(prev => ({ ...prev, implementationComment: e.target.value }))}
                    rows="3"
                    required
                  />
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Implementation Status'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  );
}