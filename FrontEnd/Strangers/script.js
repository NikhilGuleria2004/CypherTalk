let messages = [];
let strangers = [
    "Stranger 1: Hello!",
    "Stranger 2: Hey, what's up?",
    "Stranger 3: How's it going?",
    "Stranger 4: What's your name?",
    "Stranger 5: Wanna talk about the weather?",
    "Stranger 6: I'm bored. Let's chat!"
];

let currentStrangerIndex = 0;

function connectToStranger() {
    // Clear previous messages
    messages = [];

    // Select a new stranger message
    currentStrangerIndex = (currentStrangerIndex + 1) % strangers.length;
    const strangerMessage = strangers[currentStrangerIndex];

    // Add new stranger's message
    messages.push({ text: strangerMessage, time: getCurrentTime(), type: 'received' });

    // Display the new message
    displayMessages();
}

function sendMessage() {
    const messageInput = document.getElementById('chatInput');
    const messageText = messageInput.value.trim();

    if (messageText !== '') {
        const currentTime = getCurrentTime();

        // Add the sent message
        messages.push({ text: messageText, time: currentTime, type: 'sent' });
        displayMessages();

        // Clear input field
        messageInput.value = '';
    }
}

function displayMessages() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = ''; // Clear previous messages

    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', msg.type);
        messageDiv.innerHTML = `
            <span class="message-text">${msg.text}</span>
            <span class="message-time">${msg.time}</span>
        `;
        chatMessages.appendChild(messageDiv);
    });

    // Scroll to the bottom to show the newest message
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function checkEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Initial call to connect to the first stranger
connectToStranger();
