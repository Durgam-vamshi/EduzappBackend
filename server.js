const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const connectDB = require('./db/config');
const requestRoutes = require('./routes/requestRoutes');


const app = express();
const server = http.createServer(app);


// Socket.IO setup
const io = new Server(server, {
cors: { origin: '*' }
});


app.locals.io = io; // make io accessible in controllers via req.app.locals.io


io.on('connection', (socket) => {
console.log('socket connected:', socket.id);
socket.on('disconnect', () => console.log('socket disconnected:', socket.id));
});


// Basic rate limiter - keep it permissive but protect from abuse
const limiter = rateLimit({
windowMs: 60 * 1000, // 1 minute
max: 120 // limit each IP to 120 requests per windowMs
});


app.use(cors());
app.use(express.json());
app.use(limiter);


connectDB();


app.use('/api', requestRoutes);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

