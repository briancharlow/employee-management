document.addEventListener("DOMContentLoaded", function () {
  const API_URL = "http://localhost:3000";

  const userId = 2;
  const recipientId = 3;

  async function displayMessages(conversation) {
    const messagesContainer = document.getElementById("messages-container");
    if (messagesContainer) {
      messagesContainer.innerHTML = "";

      conversation.messages.forEach((message) => {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        messageElement.textContent = `${
          message.senderId === userId ? "Sender" : "Recipient"
        }: ${message.content}`;
        messagesContainer.appendChild(messageElement);
      });

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
  async function getConversation() {
    const response = await fetch(`${API_URL}/conversations`);
    const conversations = await response.json();
    return conversations.find(
      (conv) =>
        conv.participants.includes(userId) &&
        conv.participants.includes(recipientId)
    );
  }

  async function sendMessage(messageContent) {
    const conversation = await getConversation();
    if (conversation && conversation.id) {
      const newMessage = {
        senderId: userId,
        content: messageContent,
        timestamp: new Date().toISOString(),
      };

      conversation.messages.push(newMessage);

      await fetch(`${API_URL}/conversations/${conversation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation.messages }),
      });

      displayMessages(conversation);
    }
  }
  document
    .getElementById("message-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const messageInput = document.getElementById("message-input");
      const messageContent = messageInput.value.trim();

      if (messageContent) {
        sendMessage(messageContent);
        messageInput.value = "";
      }
    });
  async function initializeChat() {
    const conversation = await getConversation();
    if (conversation) displayMessages(conversation);
  }

  async function pollConversation() {
    const conversation = await getConversation();
    if (conversation) displayMessages(conversation);
    setTimeout(pollConversation, 3000);
  }

  initializeChat();
  pollConversation();
});
