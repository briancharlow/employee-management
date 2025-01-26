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
	let userLoggedIn = await getSingleUser('2');
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
            <button class="update" onclick="updateEmployee(${user.id})">Update</button>
            <button class="delete" onclick="deleteEmployee(${user.id})">Delete</button>
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
