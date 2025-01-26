const API_URL = "http://localhost:3000";
let userId = 2;
let selectedConversation = null;

async function fetchConversations() {
  const response = await fetch(`${API_URL}/conversations`);
  const conversations = await response.json();

  const conversationsContainer = document.getElementById("conversations");
  conversationsContainer.innerHTML = "";

  conversations.forEach(conversation => {
    const button = document.createElement("button");
    button.textContent = `Conversation with User ${conversation.participants.find(p => p !== userId)}`;
    button.onclick = () => selectConversation(conversation);
    conversationsContainer.appendChild(button);
  });
}

function selectConversation(conversation) {
  selectedConversation = conversation;
  displayMessages(conversation);
}

function displayMessages(conversation) {
  const messagesContainer = document.getElementById("messages-container");
  messagesContainer.innerHTML = "";

  conversation.messages.forEach(message => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    if (message.senderId === userId) {
      messageElement.classList.add("you");
      messageElement.textContent = `You: ${message.content}`;
    } else {
      messageElement.classList.add("recipient");
      messageElement.textContent = `Recipient: ${message.content}`;
    }
    messagesContainer.appendChild(messageElement);
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendMessage(content) {
  if (!selectedConversation) return;

  const newMessage = {
    senderId: userId,
    content,
    timestamp: new Date().toISOString(),
  };

  selectedConversation.messages.push(newMessage);

  await fetch(`${API_URL}/conversations/${selectedConversation.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: selectedConversation.messages }),
  });

  displayMessages(selectedConversation);
}

async function pollMessages() {
  if (selectedConversation) {
    const response = await fetch(`${API_URL}/conversations/${selectedConversation.id}`);
    const updatedConversation = await response.json();

    if (JSON.stringify(updatedConversation.messages) !== JSON.stringify(selectedConversation.messages)) {
      selectedConversation = updatedConversation;
      displayMessages(updatedConversation);

      const newMessages = updatedConversation.messages.filter(
        msg => msg.senderId !== userId && !selectedConversation.messages.includes(msg)
      );
      if (newMessages.length > 0) {
        alert("New message received!");
      }
    }
  }
}
document.getElementById("message-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const messageInput = document.getElementById("message-input");
  const content = messageInput.value.trim();

  if (content) {
    sendMessage(content);
    messageInput.value = "";
  }
});

setInterval(pollMessages, 3000); 
fetchConversations();
