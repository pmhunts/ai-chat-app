import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api';

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    try {
      const response = await fetch(`${API_URL}/messages`);
      const data = await response.json();
      setMessages(data.messages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }

  

  async function handleInputChange(e) {
    setInput(e.target.value);
    if (e.key === 'Enter' && !loading && input.trim()) {
      await handleSend() ;
            }


  async function handleSend() {
    if (!input.trim() || loading) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();
      setInput('');
      await loadMessages(); // Reload all messages
    } catch (err) {
      console.error('Failed to send message:', err);
    }
    setLoading(false);
  }

  async function clearChat() {
    try {
      await fetch(`${API_URL}/messages`, { method: 'DELETE' });
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', fontFamily: 'Arial' }}>
      <h1>AI Chat Application</h1>
      <p style={{ color: '#666' }}>Chat with AI - History saved in backend</p>
      
      <div style={{ 
        border: '1px solid #ccc', 
        height: '400px', 
        overflowY: 'scroll',
        padding: '10px',
        marginBottom: '10px',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
            No messages yet. Start chatting!
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} style={{
            margin: '10px 0',
            padding: '10px',
            backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#fff',
            borderRadius: '5px',
            border: '1px solid #ddd'
          }}>
            <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.text}
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              {msg.time}
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={{ padding: '10px', color: '#666' }}>
            AI is typing...............
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message here..."
          style={{ 
            flex: 1, 
            padding: '10px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
          disabled={loading}
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <button 
        onClick={clearChat}
        style={{ 
          marginTop: '10px', 
          padding: '8px 15px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Clear Chat History
      </button>
    </div>
  );
}