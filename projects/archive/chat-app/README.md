# Chat Application

A real-time chat application using Socket.io with room support, typing indicators, and user presence.

## Features

- **Real-time Messaging**: Instant message delivery using WebSockets
- **Room Support**: Join different chat rooms
- **User Presence**: See who's online in each room
- **Typing Indicators**: See when others are typing
- **System Messages**: Notifications when users join/leave
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

### Server
- Node.js + Express
- Socket.io

### Client
- React 19 + TypeScript
- Socket.io-client
- Vite (build tool)

## Key Learning Concepts

1. **WebSocket Connection**: Persistent bidirectional communication
2. **Socket.io Rooms**: Broadcasting to specific groups of users
3. **State Management**: Using `setList((prev) => [...prev, newMessage])` pattern
4. **Event-Driven Architecture**: Listening and emitting socket events
5. **Custom Hooks**: `useSocket` encapsulates all socket logic

## Project Structure

```
chat-app/
├── server/
│   ├── index.js          # Socket.io server with room logic
│   └── package.json
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── JoinRoom.tsx    # Room selection UI
    │   │   └── ChatRoom.tsx    # Chat interface
    │   ├── hooks/
    │   │   └── useSocket.ts    # Socket.io hook
    │   ├── types/
    │   │   └── index.ts        # TypeScript interfaces
    │   ├── App.tsx
    │   └── App.css
    └── package.json
```

## Setup

### Server

```bash
cd server
npm install
npm run dev
```

Server runs on `http://localhost:3001`

### Client

```bash
cd client
npm install
npm run dev
```

Client runs on `http://localhost:5173`

## Socket Events

### Client → Server
- `join_room` - Join a chat room with username
- `send_message` - Send a message to the room
- `typing` - Notify others of typing status

### Server → Client
- `receive_message` - New message received
- `user_joined` - User joined the room
- `user_left` - User left the room
- `room_users` - Updated list of users in room
- `user_typing` - Someone is typing

## The Secret Sauce

**State Management**: When a new message arrives, you must append it to the existing array without mutating state:

```javascript
socket.on('receive_message', (data) => {
  setMessages((prev) => [...prev, data]);
});
```

Using the callback form of `setState` ensures you always have the latest state, avoiding race conditions with multiple rapid messages.

**Rooms**: Socket.io rooms allow broadcasting to specific groups:

```javascript
// Server: Only send to users in the same room
socket.to(data.room).emit('receive_message', data);
```
