const socket = io();

//DOM elements
const $messageForm = document.querySelector('#messageForm');
const $messageInput = document.querySelector('#message');
const $sendMessageBtn = $messageForm.querySelector('button');
const $sendLocationBtn = document.querySelector('#shareLocation');
const $messagesDiv = document.querySelector('#messages');
const $sidebarDiv = document.querySelector('#sidebar');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Parse query string
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

//method to autoscroll on new message
const autoscroll = () => {
    //Get the newest message appended to the #messages div
    const $newMessageElement = $messagesDiv.lastElementChild;
    console.log($newMessageElement)

    //Height of the new message
    const newMessageElementStyles = getComputedStyle($newMessageElement);
    const newMessageElementMargin = parseInt(newMessageElementStyles.marginBottom);
    const newMessageElementHeight = newMessageElementMargin + $newMessageElement.offsetHeight

    //visible height
    const visibleHeight = $messagesDiv.offsetHeight

    //height of the messages container
    const containerheight = $messagesDiv.scrollHeight

    //How far have I scrolled
    const scrollOffset = $messagesDiv.scrollTop + visibleHeight;

    if (containerheight - newMessageElementHeight <= scrollOffset) {
        $messagesDiv.scrollTop = $messagesDiv.scrollHeight
    }

    console.log(newMessageElementHeight);
}


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});

socket.on('roomData', ({ room, users }) => {
    console.log(room, users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebarDiv.innerHTML = html;
})


socket.on('message', ({ user, text, createdAt }) => {
    console.log(`Message: ${text}`);
    const html = Mustache.render(messageTemplate, {
        username: user.username,
        message: text,
        createdAt: moment(createdAt).format('h:mm a')
    });
    $messagesDiv.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('locationMessage', ({ user, text, createdAt }) => {
    console.log(`Message: ${text}`);
    const html = Mustache.render(locationTemplate, {
        username: user.username,
        location: text,
        createdAt: moment(createdAt).format('h:mm a')
    });
    $messagesDiv.insertAdjacentHTML('beforeend', html);
    autoscroll()
})

// socket.on('roomData', ({ users, room }) => {
//     console.log(users);
//     console.log(room);
// })

$messageForm.addEventListener('submit', (event) => {

    event.preventDefault();

    if (!$messageInput.value)
        return;

    $sendMessageBtn.setAttribute('disabled', 'disabled');

    socket.emit('sendMessage', $messageInput.value, () => {

        console.log('Message Delivered');

        $messageInput.value = '';
        $messageInput.focus();

        $sendMessageBtn.removeAttribute('disabled');
    });
})

$sendLocationBtn.addEventListener('click', () => {
    $sendLocationBtn.setAttribute('disabled', 'disabled');
    if (!navigator.geolocation) {
        return alert('Location not available');
    }

    navigator.geolocation.getCurrentPosition(({ coords }) => {

        socket.emit('sendLocation', {
            lat: coords.latitude,
            long: coords.longitude
        }, () => {
            console.log('Location shared!');
            $sendLocationBtn.removeAttribute('disabled');
        });
    })
})