import React, { useState, useRef } from 'react';
import Navbar from './navBar';
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
const GEMINI_API_KEY = 'AIzaSyDytJrjHa71tbEM7DkldgYf_clQSV72BbU';

const GeminiChatbot = () => {
  const [messages, setMessages] = useState([{
    sender: 'assistant',
    message: "👋 Hi! I'm Gemini, your AI assistant. I can help you with questions, writing, analysis, and more. What would you like to explore today?"
  }]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const handleGeminiQuery = async (query) => {
    try {
      const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: query
            }]
          }]
        })
      });

      const data = await response.json();

      if (data.candidates && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      }
      throw new Error('Invalid response from Gemini API');
    } catch (error) {
      console.error(error);
      return "I'm having trouble processing your request. Please try again later.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userInput.trim() === '') return;

    setMessages(prev => [...prev, { sender: 'user', message: userInput }]);
    setUserInput('');
    setLoading(true);

    const response = await handleGeminiQuery(userInput);
    setMessages(prev => [...prev, { sender: 'assistant', message: response }]);
    setLoading(false);
    scrollToBottom();
  };

  const handleClear = () => {
    setMessages([{
      sender: 'assistant',
      message: "👋 Hi! I'm Gemini, your AI assistant. I can help you with questions, writing, analysis, and more. What would you like to explore today?"
    }]);
    setUserInput('');
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  return (
    
    <div className="app">
              <div className="gradient-overlay" />
      <div className="chat-container">
        {/* Header */}
        <header className="chat-header">
          <div className="header-content">
            <h1>Gemini Chat</h1>
            <p>Your AI-powered conversation partner</p>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="messages-container" ref={chatContainerRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender}`}
            >
              {msg.message}
            </div>
          ))}
          {loading && (
            <div className="message assistant loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="input-area">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message..."
            />
            <div className="button-group">
              <button type="submit" className="send-button" disabled={loading}>
                {loading ? 'Sending...' : 'Send'}
              </button>
              <button type="button" className="clear-button" onClick={handleClear}>
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="chat-footer">
          <p>Powered by Google's Gemini AI • Built with React</p>
        </footer>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app {
          min-height: 100vh;
          background: #121721;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .chat-container {
          width: 100%;
          max-width: 800px;
          height: 90vh;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .chat-header {
          padding: 20px;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }

        .header-content h1 {
          color: #e2e8f0;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .header-content p {
          color: #a0aec0;
          font-size: 14px;
        }

        .messages-container {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
          background: #121721;
        }

        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .message {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 15px;
          animation: fadeIn 0.3s ease-out;
          line-height: 1.5;
          color: #e2e8f0;
        }

        .message.assistant {
          background: rgba(255, 255, 255, 0.05);
          align-self: flex-start;
          border-bottom-left-radius: 5px;
        }

        .message.user {
          background: #ff4757;
          align-self: flex-end;
          border-bottom-right-radius: 5px;
        }

        .input-area {
          padding: 20px;
          background: rgba(255, 255, 255, 0.03);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .input-area form {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .input-area input {
          flex: 1;
          padding: 12px 16px;
          border: none;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
          font-size: 14px;
          transition: all 0.3s ease;
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
        .input-area input::placeholder {
          color: #a0aec0;
        }

        .input-area input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 0 2px rgba(255, 71, 87, 0.3);
        }

        .button-group {
          display: flex;
          gap: 10px;
        }

        .send-button, .clear-button {
          padding: 12px 24px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          color: #e2e8f0;
        }

        .send-button {
          background: #ff4757;
        }

        .send-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 71, 87, 0.3);
        }

        .send-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .clear-button {
          background: rgba(255, 255, 255, 0.05);
        }

        .clear-button:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .chat-footer {
          padding: 15px;
          text-align: center;
          color: #a0aec0;
          font-size: 12px;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 12px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #a0aec0;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        @media (max-width: 600px) {
          .chat-container {
            height: 100vh;
            border-radius: 0;
          }

          .message {
            max-width: 90%;
          }

          .input-area {
            padding: 15px;
          }

          .button-group {
            width: 100%;
          }

          .send-button, .clear-button {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default GeminiChatbot;