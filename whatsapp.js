// ================= WHATSAPP CHAT FUNCTIONS =================
function toggleWhatsApp() {
    const chat = document.getElementById('whatsappChat');
    chat.classList.toggle('active');
}

function sendWAMessage() {
    const msgInput = document.getElementById('waMessage');
    const chatBody = document.getElementById('waChatBody');
    const message = msgInput.value.trim();
    
    const gymPhoneNumber = "917597572392"; 

    if (message) {
        const userMsgDiv = document.createElement('div');
        userMsgDiv.className = 'message-sent';
        userMsgDiv.innerHTML = `<p class="mb-0">${message}</p><small class="text-muted" style="font-size: 0.7rem; opacity: 0.7;">Just now</small>`;
        chatBody.appendChild(userMsgDiv);

        msgInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;

        setTimeout(() => {
            const replyDiv = document.createElement('div');
            replyDiv.className = 'message-received';
            replyDiv.innerHTML = `<p class="mb-0">Connecting you to our official WhatsApp to securely send your message...</p><small class="text-muted" style="font-size: 0.7rem; opacity: 0.7;">System</small>`;
            chatBody.appendChild(replyDiv);
            chatBody.scrollTop = chatBody.scrollHeight;

            setTimeout(() => {
                const whatsappUrl = `https://wa.me/${gymPhoneNumber}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
                toggleWhatsApp(); 
            }, 1500);
        }, 800);
    }
}

function handleWAKey(event) {
    if (event.key === 'Enter') {
        sendWAMessage();
    }
}
