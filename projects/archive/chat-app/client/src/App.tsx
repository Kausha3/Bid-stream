import { useState, useCallback } from 'react';
import JoinRoom from './components/JoinRoom';
import ChatRoom from './components/ChatRoom';
import { useSocket } from './hooks/useSocket';
import './App.css';

function App() {
  const [currentRoom, setCurrentRoom] = useState<{ username: string; room: string } | null>(null);
  const { isConnected, messages, roomUsers, typingUsers, joinRoom, sendMessage, sendTyping } = useSocket();

  const handleJoin = useCallback((username: string, room: string) => {
    joinRoom(username, room);
    setCurrentRoom({ username, room });
  }, [joinRoom]);

  const handleSendMessage = useCallback((message: string) => {
    if (currentRoom) {
      sendMessage(message, currentRoom.room);
    }
  }, [currentRoom, sendMessage]);

  const handleTyping = useCallback((isTyping: boolean) => {
    if (currentRoom) {
      sendTyping(currentRoom.room, isTyping);
    }
  }, [currentRoom, sendTyping]);

  const handleLeave = useCallback(() => {
    setCurrentRoom(null);
  }, []);

  if (!currentRoom) {
    return <JoinRoom onJoin={handleJoin} isConnected={isConnected} />;
  }

  return (
    <ChatRoom
      username={currentRoom.username}
      room={currentRoom.room}
      messages={messages}
      roomUsers={roomUsers}
      typingUsers={typingUsers}
      onSendMessage={handleSendMessage}
      onTyping={handleTyping}
      onLeave={handleLeave}
    />
  );
}

export default App;
