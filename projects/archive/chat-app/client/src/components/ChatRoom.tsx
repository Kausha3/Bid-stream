import { useState, useEffect, useRef } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import type { Message, SystemMessage, User } from '../types';

interface ChatRoomProps {
  username: string;
  room: string;
  messages: (Message | SystemMessage)[];
  roomUsers: User[];
  typingUsers: string[];
  onSendMessage: (message: string) => void;
  onTyping: (isTyping: boolean) => void;
  onLeave: () => void;
}

const isMessage = (msg: Message | SystemMessage): msg is Message => {
  return 'color' in msg && 'id' in msg;
};

const ChatRoom = ({
  username,
  room,
  messages,
  roomUsers,
  typingUsers,
  onSendMessage,
  onTyping,
  onLeave
}: ChatRoomProps) => {
  const [message, setMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      onTyping(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Form will handle submit
    }
  };

  const handleInputChange = (value: string) => {
    setMessage(value);

    // Send typing indicator
    if (value.trim()) {
      onTyping(true);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing indicator after 2 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    } else {
      onTyping(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTypingUsers = typingUsers.filter((u) => u !== username);

  return (
    <div className="chat-container">
      {/* Header */}
      <header className="chat-header">
        <div className="header-left">
          <button className="back-button" onClick={onLeave}>
            ←
          </button>
          <div className="room-info">
            <h2>#{room}</h2>
            <span className="user-count">{roomUsers.length} online</span>
          </div>
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          👥
        </button>
      </header>

      <div className="chat-body">
        {/* Messages */}
        <div className="messages-container">
          <div className="messages">
            {messages.map((msg, index) => {
              if (!isMessage(msg)) {
                return (
                  <div key={`system-${index}`} className="system-message">
                    {msg.message}
                  </div>
                );
              }

              const isOwn = msg.username === username;
              return (
                <div
                  key={msg.id}
                  className={`message ${isOwn ? 'own' : ''}`}
                >
                  {!isOwn && (
                    <div
                      className="avatar"
                      style={{ backgroundColor: msg.color }}
                    >
                      {msg.username[0].toUpperCase()}
                    </div>
                  )}
                  <div className="message-content">
                    {!isOwn && <span className="message-username">{msg.username}</span>}
                    <div className="message-bubble">
                      <p>{msg.message}</p>
                      <span className="message-time">{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {filteredTypingUsers.length > 0 && (
            <div className="typing-indicator">
              <span className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
              {filteredTypingUsers.length === 1
                ? `${filteredTypingUsers[0]} is typing...`
                : `${filteredTypingUsers.length} people are typing...`}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className={`sidebar ${showSidebar ? 'open' : ''}`}>
          <h3>Online Users</h3>
          <ul className="user-list">
            {roomUsers.map((user) => (
              <li key={user.id} className="user-item">
                <div
                  className="user-avatar"
                  style={{ backgroundColor: user.color }}
                >
                  {user.username[0].toUpperCase()}
                </div>
                <span className="user-name">
                  {user.username}
                  {user.username === username && ' (you)'}
                </span>
                {typingUsers.includes(user.username) && (
                  <span className="typing-badge">typing...</span>
                )}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          maxLength={500}
          autoFocus
        />
        <button type="submit" disabled={!message.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
