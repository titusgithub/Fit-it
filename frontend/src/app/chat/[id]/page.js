'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import './chat.css';

export default function ChatPage() {
  const { id: requestId } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchRequest();
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [user, requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRequest = async () => {
    try {
      const data = await apiGet(`/requests/${requestId}`);
      setRequest(data);
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async () => {
    try {
      const data = await apiGet(`/chat/${requestId}`);
      setMessages(data.messages || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !request) return;

    const receiverId = user.id === request.customer_id
      ? request.technician_id
      : request.customer_id;

    try {
      await apiPost('/chat', {
        request_id: requestId,
        receiver_id: receiverId,
        content: newMsg,
      });
      setNewMsg('');
      fetchMessages();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="chat-page">
      <div className="container">
        <div className="chat-container card animate-fadeIn">
          {/* Chat Header */}
          <div className="chat-header">
            <button className="btn btn-sm btn-secondary" onClick={() => router.back()}>← Back</button>
            <div className="chat-header-info">
              <h2 className="chat-header-title">{request?.title || 'Chat'}</h2>
              <p className="chat-header-meta">
                {request?.service_name && `${request.service_icon} ${request.service_name} • `}
                {user?.role === 'customer' ? request?.technician_name : request?.customer_name}
              </p>
            </div>
            <span className={`badge ${request?.status === 'completed' ? 'badge-success' : 'badge-accent'}`}>
              {request?.status}
            </span>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {loading ? (
              <div className="chat-loading">Loading messages...</div>
            ) : messages.length > 0 ? (
              messages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.sender_id === user?.id ? 'sent' : 'received'}`}>
                  <div className="chat-bubble">
                    <span className="chat-sender">{msg.sender_name}</span>
                    <p className="chat-text">{msg.content}</p>
                    <span className="chat-time">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="chat-empty">
                <span>💬</span>
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="chat-input-area" onSubmit={sendMessage}>
            <input
              type="text"
              className="chat-input"
              placeholder="Type a message..."
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn-primary chat-send-btn" disabled={!newMsg.trim()}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
