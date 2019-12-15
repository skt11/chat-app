const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const { getMessage } = require('./utils/message');
const { addUser,
    removeUser,
    getUser,
    getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;

//Setup paths for the application
const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

let count = 0;
io.on('connection', (socket) => {

    socket.on('join', ({ username, room }, callback) => {

        const { error, user } = addUser(socket.id, username, room);

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        socket.emit('message', getMessage(user, 'Welcome!'));
        socket.broadcast.to(user.room).emit('message', getMessage(user, `${user.username} has joined!`));

        callback();
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', getMessage(user, message));
            callback()
        }
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', getMessage(user, `${user.username} disconnected`));
            socket.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })

    socket.on('sendLocation', ({ lat, long }, callback) => {

        const user = getUser(socket.id);

        if (user) {
            io.to(user.room).emit('locationMessage', getMessage(user, `https://google.com/maps?q=${lat},${long}`));
            callback();
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up at ${port}`);
})