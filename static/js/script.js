let sendBtn = document.getElementById('send-btn')
sendBtn.addEventListener('click', sendMessageToAi);

let messageInput = document.getElementById('message-input')
messageInput.addEventListener('keydown', function(event) {
    if (event.key === '13' || event.key === 13) {
        event.preventDefault();
        sendMessageToAi(); 
    }
});

function sendMessageToAi(){
    const message = document.getElementById('message-input').value;
    if (message) {
        appendMessage("Tú: " + message);
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        })
        .then(response => response.json())
        .then(data => {
            appendMessage(data.response);
        });
        document.getElementById('message-input').value = '';
    }
}
function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    document.getElementById('messages').appendChild(messageElement);
    const chatBox = document.getElementById('chat-box');
    chatBox.scrollTop = chatBox.scrollHeight;
}
function appendLine(message) {
    const line = document.createElement('hr');
    
    document.getElementById('messages').appendChild(messageElement);
    const chatBox = document.getElementById('chat-box');
    chatBox.scrollTop = chatBox.scrollHeight;
}
