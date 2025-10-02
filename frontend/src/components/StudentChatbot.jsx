import { useState, useEffect, useRef } from 'react';
import { chatbotAPI } from '../api/chatbot.js';
import './StudentChatbot.css';

export default function StudentChatbot({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat history when component mounts
  useEffect(() => {
    if (isOpen && currentUser?.role === 'Student') {
      loadChatHistory();
    }
  }, [isOpen, currentUser]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await chatbotAPI.getChatHistory();
      setMessages(response.messages || []);
      setError(null);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setError('Failed to load chat history');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      sender: 'student',
      text: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Send message to backend
      const response = await chatbotAPI.sendMessage(userMessage.text);
      
      // Add bot response to UI
      const botMessage = {
        sender: 'bot',
        text: response.response,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.response?.data?.message || 'Failed to send message. Please try again.');
      
      // Remove the user message if sending failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your chat history? This action cannot be undone.')) {
      return;
    }

    try {
      await chatbotAPI.clearChatHistory();
      setMessages([]);
      setError(null);
    } catch (error) {
      console.error('Error clearing chat history:', error);
      setError('Failed to clear chat history');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  // Don't render for non-students
  if (currentUser?.role !== 'Student') {
    return null;
  }

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button 
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Study Buddy AI"
      >
        🤖
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-title">
              <span className="chatbot-icon">🤖</span>
              <div>
                <h3>Study Buddy AI</h3>
                <p>Your AI learning companion</p>
              </div>
            </div>
            <div className="chatbot-actions">
              {messages.length > 0 && (
                <button 
                  className="clear-btn"
                  onClick={clearHistory}
                  title="Clear chat history"
                >
                  🗑️
                </button>
              )}
              <button 
                className="close-btn"
                onClick={() => setIsOpen(false)}
                title="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <div className="welcome-icon">👋</div>
                <h4>Hi there! I'm your Study Buddy AI</h4>
                <p>I'm here to help you with your studies. Ask me anything about:</p>
                <ul>
                  <li>📚 Explaining concepts</li>
                  <li>🧮 Solving problems</li>
                  <li>📝 Study tips</li>
                  <li>🎯 Learning strategies</li>
                </ul>
                <p>What would you like to learn about today?</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`message ${message.sender === 'student' ? 'student-message' : 'bot-message'}`}
                >
                  <div className="message-avatar">
                    {message.sender === 'student' ? 
                      currentUser?.name?.charAt(0).toUpperCase() || 'S' : 
                      '🤖'
                    }
                  </div>
                  <div className="message-content">
                    <div className="message-text">{message.text}</div>
                    <div className="message-time">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="message bot-message">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="chatbot-input-form">
            <div className="input-container">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about your studies..."
                className="message-input"
                disabled={isLoading}
                maxLength={1000}
              />
              <button 
                type="submit" 
                className="send-btn"
                disabled={!inputMessage.trim() || isLoading}
              >
                {isLoading ? '⏳' : '➤'}
              </button>
            </div>
            <div className="input-hint">
              Press Enter to send • {1000 - inputMessage.length} characters remaining
            </div>
          </form>
        </div>
      )}
    </>
  );
}
