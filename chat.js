const API_URL = "http://localhost:3000";

// Get current user from localStorage properly
let currentUser = localStorage.getItem('currentUser') 
    ? JSON.parse(localStorage.getItem('currentUser'))
    : null;
let userId = currentUser ? currentUser.id : null;
let selectedConversation = null;

async function getUsers() {
    try {
        let response = await fetch(`${API_URL}/users`);
        if (!response.ok) {
            throw new Error(`HTTP Error occurred ${response.status}: ${response.statusText}`);
        }
        let usersFound = await response.json();
        // Filter out the current user from the list
        return usersFound.filter(user => user.id !== userId);
    } catch (error) {
        console.error('Something unexpected happened', error.message);
        throw error;
    }
}


async function populateUserSelect() {
    try {
        const users = await getUsers();
        const userSelect = document.getElementById("user-select");
        userSelect.innerHTML = '<option value="">Select a user to chat with...</option>';

        users.forEach(user => {
            const option = document.createElement("option");
            option.value = user.id;
            option.textContent = user.name;
            userSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to populate user select', error.message);
    }
}

async function createNewConversation(selectedUserId) {
    try {
        // Check if conversation already exists
        const existingConvs = await fetch(`${API_URL}/conversations`);
        const conversations = await existingConvs.json();
        
        const existingConversation = conversations.find(conv => 
            conv.participants.includes(userId) && 
            conv.participants.includes(selectedUserId)
        );

        if (existingConversation) {
            // Ensure messages array exists
            if (!existingConversation.messages) {
                const response = await fetch(`${API_URL}/conversations/${existingConversation.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messages: [] }),
                });
                return await response.json();
            }
            return existingConversation;
        }

        // Create new conversation if none exists
        const response = await fetch(`${API_URL}/conversations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                participants: [userId, selectedUserId],
                messages: []
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create conversation');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating conversation:', error);
        alert('Failed to create conversation');
    }
}

async function fetchConversations() {
    try {
        const response = await fetch(`${API_URL}/conversations`);
        const allConversations = await response.json();
        
        // Filter conversations where current user is a participant
        const userConversations = allConversations.filter(conv => 
            conv.participants.includes(userId)
        );

        const conversationsContainer = document.getElementById("conversations");
        conversationsContainer.innerHTML = "";

        for (const conversation of userConversations) {
            // Ensure messages array exists
            if (!conversation.messages) {
                await fetch(`${API_URL}/conversations/${conversation.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messages: [] }),
                });
                conversation.messages = [];
            }

            const otherParticipantId = conversation.participants.find(p => p !== userId);
            // Fetch other participant's details
            const userResponse = await fetch(`${API_URL}/users/${otherParticipantId}`);
            const otherUser = await userResponse.json();
            
            const button = document.createElement("button");
            button.textContent = `Chat with ${otherUser.name}`;
            button.onclick = () => selectConversation(conversation);
            conversationsContainer.appendChild(button);
        }
    } catch (error) {
        console.error('Error fetching conversations:', error);
    }
}

// Event listener for user selection
document.getElementById("user-select").addEventListener("change", async (event) => {
    const selectedUserId = event.target.value;
    if (selectedUserId) {
        const conversation = await createNewConversation(selectedUserId);
        if (conversation) {
            selectConversation(conversation);
            await fetchConversations();
        }
    }
});

async function selectConversation(conversation) {
    // Ensure messages array exists in the database
    if (!conversation.messages) {
        try {
            const response = await fetch(`${API_URL}/conversations/${conversation.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [] }),
            });
            if (response.ok) {
                conversation.messages = [];
            } else {
                throw new Error('Failed to initialize messages array');
            }
        } catch (error) {
            console.error('Error initializing messages:', error);
            return;
        }
    }
    
    selectedConversation = conversation;
    displayMessages(conversation);
    // Show the message input form when conversation is selected
    document.getElementById("message-form").style.display = "block";
}
async function displayMessages(conversation) {
  
  const messagesContainer = document.getElementById("messages-container");
  messagesContainer.innerHTML = "";

  // Fetch latest conversation data to ensure we have the most recent messages
  try {
      const response = await fetch(`${API_URL}/conversations/${conversation.id}`);
      if (!response.ok) {
          throw new Error('Failed to fetch conversation');
      }
      const updatedConversation = await response.json();
      // Update both the passed conversation and selectedConversation references
      conversation.messages = updatedConversation.messages || [];
      if (selectedConversation && selectedConversation.id === conversation.id) {
          selectedConversation = updatedConversation;
      }
  } catch (error) {
      console.error('Error fetching messages:', error);
      return;
  }

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
  if (!selectedConversation || !content.trim()) return;

  try {
      const newMessage = {
          senderId: userId,
          content: content.trim(),
          timestamp: new Date().toISOString(),
      };

      // Ensure messages array exists
      const messages = [...(selectedConversation.messages || []), newMessage];

      const response = await fetch(`${API_URL}/conversations/${selectedConversation.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
          throw new Error('Failed to send message');
      }

      // Update the local conversation object with the new messages
      selectedConversation.messages = messages;
      
      // Add the new message to the UI directly
      const messagesContainer = document.getElementById("messages-container");
      const messageElement = document.createElement("div");
      messageElement.classList.add("message", "you");
      messageElement.textContent = `You: ${newMessage.content}`;
      messagesContainer.appendChild(messageElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
  } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
  }
}

// Message form submit handler
document.getElementById("message-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const messageInput = document.getElementById("message-input");
    const content = messageInput.value;
    
    if (content.trim()) {
        await sendMessage(content);
        messageInput.value = "";
    }
    displayMessages(selectConversation)
});
function optionalRendering() {
  
	let link= document.querySelector('#employee-link');
	if (currentUser.role == 'employee') {
	
		link.classList.add('hidden');
	}
}
optionalRendering();

// Initialize the chat system
if (userId) {
    populateUserSelect();
    fetchConversations();
} else {
    alert('Please log in first');
}