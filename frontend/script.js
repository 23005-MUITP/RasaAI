const API_URL = "http://localhost:8000/chat";

// DOM Elements
const userQueryInput = document.getElementById('user-query');
const sendBtn = document.getElementById('send-btn');
const chatHistory = document.getElementById('chat-history');

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
userQueryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
    const query = userQueryInput.value.trim();
    if (!query) return;

    // 1. Add User Message to UI
    appendMessage('user', query);
    userQueryInput.value = '';

    // 2. Determine Loading ID to later replace or remove
    const loadingId = appendLoadingMessage();

    try {
        // 3. Call Backend
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: query })
        });

        if (!response.ok) throw new Error(`Server Error: ${response.statusText}`);

        const data = await response.json();

        // 4. Remove Loading & Add AI Message
        removeMessage(loadingId);
        appendMessage('ai', data.response);

    } catch (error) {
        console.error(error);
        removeMessage(loadingId);
        appendMessage('ai', `**Error:** ${error.message}. Is the server running?`);
    }
}

function appendMessage(role, text) {
    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble', role === 'user' ? 'user-msg' : 'ai-msg');

    const content = document.createElement('div');
    content.classList.add('message-content');

    if (role === 'ai') {
        // Parse Markdown for AI
        content.innerHTML = marked.parse(text);
    } else {
        content.textContent = text;
    }

    bubble.appendChild(content);
    chatHistory.appendChild(bubble);
    scrollToBottom();
}

function appendLoadingMessage() {
    const id = 'loading-' + Date.now();
    const bubble = document.createElement('div');
    bubble.id = id;
    bubble.classList.add('message-bubble', 'ai-msg');

    bubble.innerHTML = `
        <div class="message-content">
            <p>Processing... <i class="ph-bold ph-spinner ph-spin"></i></p>
        </div>
    `;

    chatHistory.appendChild(bubble);
    scrollToBottom();
    return id;
}

function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollToBottom() {
    chatHistory.scrollTop = chatHistory.scrollHeight;
}
