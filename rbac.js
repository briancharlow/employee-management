let usersURL = 'http://localhost:3000/users/';
let currentUser = localStorage.getItem('currentUser')
	? JSON.parse(localStorage.getItem('currentUser'))
	: null;
async function getUsers() {
	try {
		let response = await fetch(usersURL);
		if (!response.ok) {
			throw new Error(`a HTTP Error occured ${response.status}: ${response.statusText}`);
		}
		let usersFound = await response.json();
		console.log(usersFound);
		return usersFound;
	} catch (error) {
		console.error('Something unexpected happened', error.message);

		throw error;
	}
}
getUsers();
async function getSingleUser(id) {
	try {
		let response = await fetch(`${usersURL}${id}`);
		if (!response.ok) {
			throw new Error(`a HTTP Error occured when fetching single user${response.status}: ${response.statusText}`);
		}
		let userFound = await response.json();
		console.log(userFound);
		return userFound;
	} catch (error) {
		console.error(error.message);

		throw error;
	}
}
//============SELECTING THE THINGS I WANT TO SHOW/HIDE IN RBAC===============
let employeesPage = document.querySelector('.employees-page');

let employeesTable = document.querySelector('#employee-table');


async function populateProfile() {
		
	let profileInfo = document.querySelector('.profile-container');
	profileInfo.innerHTML = `
		<div class="profile-card">
				<h2>Welcome, <span id="user-name">${currentUser.name}</span></h2>
				<hr />
				<div class="info">
					<p><strong>Email:</strong> <span id="user-email">${currentUser.email}</span></p>
					<p><strong>Role:</strong> <span id="user-role">${currentUser.role}</span></p>
					<p><strong>Department:</strong> <span id="user-department">${currentUser.department}</span></p>
					<p><strong>Position:</strong> <span id="user-position">${currentUser.position}</span></p>
					<p><strong>Salary:</strong> <span id="user-salary">${currentUser.salary}</span></p>
				</div>
			</div>
	`;
	
}
 populateProfile()

async function roleBasedRendering() {
	let userLoggedIn = currentUser
	console.log('The user logged in is', userLoggedIn);
	

	let link= document.querySelector('#employee-link');
	if (currentUser.role == 'employee') {
	
		employeesPage.classList.add('hidden');
		link.classList.add('hidden');
	}
	
	let allUsers = await getUsers();
	let isAdmin = currentUser.role == 'admin';

	// employeesTable.innerHTML = '';
	allUsers.forEach((user) => {
		let newRow = document.createElement('tr');
		newRow.innerHTML = `<td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>${user.department}</td>
          <td>${user.position}</td>
          <td>${user.salary}</td>
		  ${isAdmin  ? ` <td class="action-buttons">
            <button class="update" onclick="openModal(${user.id})">Update</button>
            <button class="delete" onclick="deleteUser(${user.id})">Delete</button>
          </td>` : ''}
         `;
		employeesTable.appendChild(newRow);
		console.log(newRow);
		
		
		

	
		if (currentUser.role == 'employee') {
			console.log('The role of  user logged in is', currentUser.role);
			
			employeesPage.classList.add('hidden');
		 }
		//  else if (userLoggedIn.role == 'manager') {
		// 	updateButton.classList.add('hidden');
		// 	deleteButton.classList.add('hidden');
		// 	thingsToHide.classList.add('hidden');
		// }
	});
}
roleBasedRendering();

// Open modal and populate with user details
async function openModal(userId) {
	const users = await getUsers();
	let user = users.find((u) => u.id == userId);
	console.log('this is the selected user', user);
	console.log('And this is the selected users id', user.id);

	if (user) {
		document.getElementById('name').value = user.name;
		document.getElementById('email').value = user.email;
		document.getElementById('role').value = user.role;
		document.getElementById('department').value = user.department;
		document.getElementById('position').value = user.position;
		document.getElementById('salary').value = user.salary;
		document.getElementById('update-modal').classList.add('active');
	}

	let updateButton = document.querySelector('.update-btn');
	updateButton.addEventListener('click', async (event) => {
		event.preventDefault();
		await saveUpdates(user.id);
	});
	
}

// Save updates
// Delete user
async function deleteUser(userId) {
    try {
        // Convert userId to string to ensure consistent handling
        const id = userId.toString();
        const response = await fetch(`http://localhost:3000/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log(`User ${id} deleted successfully`);
            // Refresh the table after successful deletion
            await roleBasedRendering();
        } else {
            throw new Error(`Failed to delete user. Status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('An error occurred while deleting the user.');
    }
}

// Save updates
async function saveUpdates(userId) {
    try {
        // Convert userId to string
        const id = userId.toString();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const role = document.getElementById('role').value;
        const department = document.getElementById('department').value;
        const position = document.getElementById('position').value;
        const salary = document.getElementById('salary').value;

        const updatedDetails = { 
            id,  // Include the ID in the updated details
            name, 
            email, 
            role, 
            department, 
            position, 
            salary 
        };

        const response = await fetch(`http://localhost:3000/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedDetails)
        });

        if (!response.ok) {
            throw new Error(`Failed to update user. Status: ${response.status}`);
        }

        const updatedUser = await response.json();
        console.log('User updated successfully:', updatedUser);
        
        closeModal();
        await roleBasedRendering(); // Refresh the table
        alert('User details updated successfully!');
    } catch (error) {
        console.error('Error updating user:', error);
        alert('An error occurred while updating the user.');
    }
}
// Close modal
function closeModal() {
	document.getElementById('update-modal').classList.remove('active');
}
// Delete use

// async function updateEmployee(id) {}
