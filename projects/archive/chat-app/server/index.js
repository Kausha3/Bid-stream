import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Store active rooms and users
const rooms = new Map();

// Generate random colors for users
const getRandomColor = () => {
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c', '#e91e63', '#00bcd4'];
  return colors[Math.floor(Math.random() * colors.length)];
};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room
  socket.on('join_room', (data) => {
    const { username, room } = data;

    // Leave any previous room
    const previousRoom = socket.data.room;
    if (previousRoom) {
      socket.leave(previousRoom);
      if (rooms.has(previousRoom)) {
        rooms.get(previousRoom).delete(socket.id);
        if (rooms.get(previousRoom).size === 0) {
          rooms.delete(previousRoom);
        } else {
          io.to(previousRoom).emit('room_users', Array.from(rooms.get(previousRoom).values()));
        }
      }
    }

    // Join new room
    socket.join(room);
    socket.data.username = username;
    socket.data.room = room;
    socket.data.color = getRandomColor();

    // Add user to room
    if (!rooms.has(room)) {
      rooms.set(room, new Map());
    }
    rooms.get(room).set(socket.id, {
      id: socket.id,
      username,
      color: socket.data.color
    });

    // Send room users to everyone in the room
    io.to(room).emit('room_users', Array.from(rooms.get(room).values()));

    // Notify room of new user
    socket.to(room).emit('user_joined', {
      username,
      message: `${username} has joined the chat`,
      timestamp: new Date().toISOString()
    });

    console.log(`${username} joined room: ${room}`);
  });

  // Handle messages
  socket.on('send_message', (data) => {
    const { message, room } = data;

    if (!socket.data.username || !room) return;

    const messageData = {
      id: `${socket.id}-${Date.now()}`,
      username: socket.data.username,
      message,
      room,
      color: socket.data.color,
      timestamp: new Date().toISOString()
    };

    // Broadcast to everyone in the room (including sender)
    io.to(room).emit('receive_message', messageData);
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { room, isTyping } = data;
    if (!socket.data.username || !room) return;

    socket.to(room).emit('user_typing', {
      username: socket.data.username,
      isTyping
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const { username, room } = socket.data;

    if (room && rooms.has(room)) {
      rooms.get(room).delete(socket.id);

      if (rooms.get(room).size === 0) {
        rooms.delete(room);
      } else {
        // Notify room of user leaving
        socket.to(room).emit('user_left', {
          username,
          message: `${username} has left the chat`,
          timestamp: new Date().toISOString()
        });

        // Update room users
        io.to(room).emit('room_users', Array.from(rooms.get(room).values()));
      }
    }

    console.log(`User disconnected: ${socket.id}`);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
});
