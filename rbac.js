let usersURL = 'http://localhost:3000/users/';

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

async function roleBasedRendering() {
	let userLoggedIn = await getSingleUser('1');
	let allUsers = await getUsers();
	console.log('The user logged in is', userLoggedIn);

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
          <td class="action-buttons">
            <button class="update" onclick="openModal(${user.id})">Update</button>
            <button class="delete" onclick="deleteUser(${user.id})">Delete</button>
          </td>`;
		employeesTable.appendChild(newRow);
		let updateButton = document.querySelector('.update');
		let deleteButton = document.querySelector('.delete');
		let thingsToHide = document.querySelector('.hide-me');
		if (userLoggedIn.role == 'employee') {
			employeesPage.classList.add('hidden');
		} else if (userLoggedIn.role == 'manager') {
			updateButton.classList.add('hidden');
			deleteButton.classList.add('hidden');
			thingsToHide.classList.add('hidden');
		}
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
	await saveUpdates(user.id);
}

// Save updates
async function saveUpdates(userId) {
	try {
		const name = document.getElementById('name').value;
		const email = document.getElementById('email').value;
		const role = document.getElementById('role').value;
		const department = document.getElementById('department').value;
		const position = document.getElementById('position').value;
		const salary = document.getElementById('salary').value;

		let updatedDetails = { name, email, role, department, position, salary };

		const response = await fetch(`http://localhost:3000/users/${userId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(updatedDetails),
		});

		if (response.ok) {
			const updatedUser = await response.json();
			alert('Employee updated successfully!');
		} else {
			alert('Failed to update');
		}

		closeModal();
		populateTable();
		alert('User details updated successfully!');
	} catch (error) {
		console.error(error.message);
	}
}
// Close modal
function closeModal() {
	document.getElementById('update-modal').classList.remove('active');
}
// Delete user
async function deleteUser(userId) {
	try {
		const response = await fetch(`http://localhost:3000/users/${userId}`, {
			method: 'DELETE',
		});

		if (response.ok) {
		} else {
			alert('Failed to delete user. Please try again.');
		}
	} catch (error) {
		console.error('Error deleting user:', error);
		alert('An error occurred. Please check the console for details.');
	}
}

// async function updateEmployee(id) {}
