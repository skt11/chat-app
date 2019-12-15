let users = [];

const addUser = (id, username, room) => {
    //check if username or room is null
    if (!username || !room) {
        return {
            error: 'Username and Room is required'
        }
    }

    //make the fields case insensitive
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //check if user name already exists
    const usernameNotUnq = users.find(user => {
        return user.username === username && user.room === room
    })
    //Push if user is unique else return error
    if (!usernameNotUnq) {
        const user = {id, username, room}
        users.push(user)
        return {
            user
        }
    }

    return {
        error: 'Username exists in the room'
    }
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return users.find(user => user.id === id);
}

const getUsersInRoom = (room) => {
    let usersInRoom = [];
    usersInRoom = users.filter(user => user.room === room.toLowerCase());
    return usersInRoom;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}