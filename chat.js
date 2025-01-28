const API_URL = "http://localhost:3000";
let currentUser = localStorage.getItem("currentUser")
  ? JSON.parse(localStorage.getItem("currentUser"))
  : null;
let userId = currentUser ? currentUser.id : null;
let selectedConversation = localStorage.getItem("selectedConversation")
  ? JSON.parse(localStorage.getItem("selectedConversation"))
  : null;
async function getUsers() {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok)
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    const users = await response.json();
    return users.filter((user) => user.id !== userId);
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

async function populateUserSelect() {
  try {
    const users = await getUsers();
    const userSelect = document.getElementById("user-select");
    userSelect.innerHTML =
      '<option value="">Select a user to chat with...</option>';

    users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.name;
      userSelect.appendChild(option);
    });

    if (selectedConversation) {
      const otherUserId = selectedConversation.participants.find(
        (p) => p !== userId
      );
      userSelect.value = otherUserId;
    }
  } catch (error) {
    console.error("Error populating user select:", error);
  }
}
async function createNewConversation(selectedUserId) {
  try {
    const response = await fetch(`${API_URL}/conversations`);
    const conversations = await response.json();

    const existingConversation = conversations.find(
      (conv) =>
        conv.participants.includes(userId) &&
        conv.participants.includes(selectedUserId)
    );

    if (existingConversation) {
      return existingConversation;
    }

    const newConversation = {
      participants: [userId, selectedUserId],
      messages: [],
    };

    const createResponse = await fetch(`${API_URL}/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newConversation),
    });

    if (!createResponse.ok) throw new Error("Failed to create conversation");
    return await createResponse.json();
  } catch (error) {
    console.error("Error creating conversation:", error);
    return null;
  }
}

async function fetchConversations() {
  try {
    const response = await fetch(`${API_URL}/conversations`);
    const conversations = await response.json();
    const userConversations = conversations.filter((conv) =>
      conv.participants.includes(userId)
    );

    const conversationsContainer = document.getElementById("conversations");
    conversationsContainer.innerHTML = "";

    for (const conversation of userConversations) {
      const otherParticipantId = conversation.participants.find(
        (p) => p !== userId
      );
      const userResponse = await fetch(
        `${API_URL}/users/${otherParticipantId}`
      );
      const otherUser = await userResponse.json();

      const button = document.createElement("button");
      button.textContent = `Chat with ${otherUser.name}`;
      button.onclick = () => {
        selectConversation(conversation);
      };
      conversationsContainer.appendChild(button);
    }
  } catch (error) {
    console.error("Error fetching conversations:", error);
  }
}

async function selectConversation(conversation) {
  selectedConversation = conversation;
  localStorage.setItem("selectedConversation", JSON.stringify(conversation));
  displayMessages(conversation);
  document.getElementById("message-form").style.display = "block";
}

function displayMessages(conversation) {
  const messagesContainer = document.getElementById("messages-container");
  messagesContainer.innerHTML = "";

  conversation.messages.forEach((message) => {
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
document
  .getElementById("user-select")
  .addEventListener("change", async (event) => {
    const selectedUserId = event.target.value;

    if (!selectedUserId) return;

    const conversation = await createNewConversation(selectedUserId);

    if (conversation) {
      selectConversation(conversation);
    }
  });
async function sendMessage(content) {
  if (!selectedConversation || !content.trim()) return;

  try {
    const newMessage = {
      senderId: userId,
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...selectedConversation.messages, newMessage];

    const response = await fetch(
      `${API_URL}/conversations/${selectedConversation.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      }
    );

    if (!response.ok) throw new Error("Failed to send message");

    selectedConversation.messages = updatedMessages;
    localStorage.setItem(
      "selectedConversation",
      JSON.stringify(selectedConversation)
    );
    displayMessages(selectedConversation);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}
document
  .getElementById("message-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const messageInput = document.getElementById("message-input");
    const content = messageInput.value.trim();

    if (content) {
      await sendMessage(content);
      messageInput.value = "";
    }
  });

window.addEventListener("load", async () => {
  if (!currentUser) {
    alert("Please log in to continue");
    return;
  }

  await populateUserSelect();
  await fetchConversations();

  if (selectedConversation) {
    selectConversation(selectedConversation);
  }
});
