const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const session = require('express-session');
const helmet = require('helmet');
const errorMiddleware = require('./middleware/errorMiddleware');
const extractToken = require('./middleware/extractToken');
const config = require('./config/config');
const http = require('http');
const { Server } = require('socket.io');
const WebSocket = require('ws');
const Message = require('./models/MessageModel');
const Chat = require('./models/ChatModel');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const Notification = require('./models/NotificationModel'); 
const developerRoutes = require('./routes/developerRoutes');
const User = require('./models/UserModel');       // Import the User model
 
// Load environment variables from .env file
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// WebSocket server setup
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('CreateMessage', (message) => {
    console.log('Received new message:', message);
    io.emit('CreateMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const handleChatWebSocketConnection = async (ws, serverName) => {
  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    const { senderId, receiverId, content, role } = data;

    try {
      // Create a new message document
      const newMessage = new Message({
        sender: senderId,
        content,
        timestamp: new Date(),
      });

      // Save the message to the database
      await newMessage.save();

      // Find or create a chat between the two users (sender and receiver)
      let chat = await Chat.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      // If no chat exists, create a new one
      if (!chat) {
        chat = new Chat({
          participants: [senderId, receiverId],
          messages: [],
        });
      }

      // Add the saved message to the chat's messages array
      chat.messages.push(newMessage._id);
      await chat.save();

      // Ensure the chat is added to both the sender's and receiver's chats array
      await User.updateMany(
        { _id: { $in: [senderId, receiverId] } },
        { $addToSet: { chats: chat._id } } // Ensures chat is added only once
      );

      // Create and broadcast notification
      const notification = await Notification.create({
        user: receiverId,
        chat: chat._id,
        message: `New message from ${senderId}: ${content}`,
        type: 'new_message',
      });

      broadcastNotificationToUser(receiverId, {
        notificationId: notification._id,
        message: notification.message,
        type: notification.type,
        timestamp: notification.createdAt,
      });

      // Broadcast the message to other connected clients
      broadcastMessage(serverName, {
        senderId,
        receiverId,
        content,
        role,
        timestamp: newMessage.timestamp,
      });
    } catch (error) {
      console.error('Error saving chat message to MongoDB:', error);
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected from ${serverName}`);
  });
};


const broadcastNotificationToUser = (userId, notification) => {
  wsServer1.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.userId === userId) {
      client.send(JSON.stringify({
        type: 'new_notification',
        notification
      }));
    }
  });

  wsServer2.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.userId === userId) {
      client.send(JSON.stringify({
        type: 'new_notification',
        notification
      }));
    }
  });
};

// Function to broadcast messages to connected clients
const broadcastMessage = (serverName, data) => {
  const { senderId, receiverId, content, role, timestamp } = data;
  const serverToBroadcast = serverName === 'wsServer1' ? wsServer2 : wsServer1;

  // Log the message content
  console.log(content);

  // Broadcast the message to all connected clients on the opposite server
  serverToBroadcast.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      // Send the message data to the client
      client.send(JSON.stringify({
        senderId,
        receiverId,
        content,
        role,
        timestamp
      }));
    }
  });
};

// Initialize WebSocket servers
const wsServer1 = new WebSocket.Server({ port: 8083 });
const wsServer2 = new WebSocket.Server({ port: 8084 });

wsServer1.on('connection', (ws) => {
  console.log('Client connected to wsServer1');
  handleChatWebSocketConnection(ws, 'wsServer1');
});

wsServer2.on('connection', (ws) => {
  console.log('Client connected to wsServer2');
  handleChatWebSocketConnection(ws, 'wsServer2');
});

// Middleware setup
app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,POST,PUT',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(session({
    secret: config.jwtSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(helmet());
app.use(extractToken);
app.use(errorMiddleware);

// Routes
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/dev', developerRoutes);
/*
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI_REMOTE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connection successfully');
}).catch(err => {
    console.log('MongoDB connection failed:', err);
    process.exit(1);
});*/

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI_REMOTE)
    .then(() => {
        console.log('MongoDB connection successfully');
    })
    .catch(err => {
        console.log('MongoDB connection failed:', err);
        process.exit(1);
    });


// Start the server
const PORT = config.port || 3002;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
