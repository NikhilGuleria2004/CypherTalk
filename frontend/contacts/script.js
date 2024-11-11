let selectedContact = '';
let messages = {
    'Alice': ['Hey, how\'s it going?'],
    'Bob': ['We need to talk about the project.']
};

// Function to select a contact
function selectContact(contactName) {
    selectedContact = contactName;
    document.getElementById('chatTitle').textContent = contactName;
    displayMessages(contactName);
}

// Function to display messages of the selected contact
function displayMessages(contactName) {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = ''; // Clear current messages

    // Append stored messages for the selected contact
    if (messages[contactName]) {
        messages[contactName].forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'received');
            messageDiv.innerHTML = `<span class="message-text">${msg}</span>`;
            chatMessages.appendChild(messageDiv);
        });
    }
}

// Function to send a new message
function sendMessage() {
    const messageInput = document.getElementById('chatInput');
    const messageText = messageInput.value.trim();

    if (messageText !== '') {
        // Add the message to the chat
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'sent');
        messageDiv.innerHTML = `<span class="message-text">${messageText}</span>`;
        
        // Add message to the list of messages for the selected contact
        if (!messages[selectedContact]) {
            messages[selectedContact] = [];
        }
        messages[selectedContact].push(messageText);

        document.getElementById('chatMessages').appendChild(messageDiv);

        // Clear the input field
        messageInput.value = '';
        messageInput.focus();

        // Scroll to the bottom of the messages
        document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
    }
}

// Function to check if the Enter key was pressed
function checkEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Add event listeners to all contact elements to call selectContact on click
document.querySelectorAll('.contact').forEach(contact => {
    contact.addEventListener('click', () => {
        const contactName = contact.getAttribute('data-contact');
        selectContact(contactName);
    });
});
