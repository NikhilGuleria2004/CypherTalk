const webcamLeft = document.getElementById('webcam-left');
const webcamRight = document.getElementById('webcam-right');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const chatMessages = document.querySelector('.chat-messages');

async function startWebcams() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    webcamLeft.srcObject = stream;
    webcamRight.srcObject = stream; // Use the same stream for both or create another if needed
  } catch (error) {
    console.error('Error accessing webcam:', error);
  }
}

startWebcams();

// Handle chat message submission
messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const messageText = messageInput.value.trim();
  if (messageText) {
    // Create a new message element
    const messageElement = document.createElement('div');
    messageElement.textContent = messageText;
    messageElement.classList.add('chat-message');

    // Append the message to the chatbox
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the latest message

    // Clear the input field
    messageInput.value = '';
  }
});
