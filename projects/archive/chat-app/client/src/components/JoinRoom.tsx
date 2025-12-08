import { useState } from 'react';
import type { FormEvent } from 'react';

interface JoinRoomProps {
  onJoin: (username: string, room: string) => void;
  isConnected: boolean;
}

const SUGGESTED_ROOMS = ['general', 'random', 'tech', 'gaming'];

const JoinRoom = ({ onJoin, isConnected }: JoinRoomProps) => {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('general');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (username.trim() && room.trim()) {
      onJoin(username.trim(), room.trim().toLowerCase());
    }
  };

  return (
    <div className="join-container">
      <div className="join-card">
        <div className="join-header">
          <h1>Chat App</h1>
          <p>Join a room and start chatting!</p>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {isConnected ? 'Connected' : 'Connecting...'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="join-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              required
              disabled={!isConnected}
            />
          </div>

          <div className="form-group">
            <label htmlFor="room">Room</label>
            <input
              type="text"
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Enter room name"
              maxLength={20}
              required
              disabled={!isConnected}
            />
            <div className="suggested-rooms">
              {SUGGESTED_ROOMS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`room-tag ${room === r ? 'active' : ''}`}
                  onClick={() => setRoom(r)}
                  disabled={!isConnected}
                >
                  #{r}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="join-button"
            disabled={!isConnected || !username.trim() || !room.trim()}
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinRoom;
