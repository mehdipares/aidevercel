console.log('users.js chargé avec succès');
const API_URL = 'http://localhost:3000/api/users';

// Charger les utilisateurs existants
window.loadUsers = async function () {
    try {
        const response = await fetch(API_URL, {
            headers: { 'Authorization': localStorage.getItem('token') },
        });

        if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs');

        const users = await response.json();
        console.log('Utilisateurs récupérés :', users);

        const tableBody = document.getElementById('usersTableBody');
        tableBody.innerHTML = '';

        users.forEach(user => {
            const row = `
                <tr data-user-id="${user._id}">
                    <td>${user.name}</td>
                    <td>${user.firstname}</td>
                    <td>${user.email}</td>
                    <td>
                        <button class="edit-btn" onclick="showEditForm('${user._id}', '${user.name}', '${user.firstname}', '${user.email}')">Modifier</button>
                        <button class="delete-btn" onclick="deleteUser('${user._id}')">Supprimer</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs :', error);
    }
};

// Ajouter un utilisateur
document.getElementById('addUserForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const firstname = document.getElementById('firstname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token'),
            },
            body: JSON.stringify({ name, firstname, email, password }),
        });

        if (!response.ok) throw new Error('Erreur lors de l\'ajout de l\'utilisateur');

        alert('Utilisateur ajouté avec succès !');
        loadUsers(); // Recharge la liste
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'utilisateur :', error);
    }
});

// Supprimer un utilisateur
window.deleteUser = async function (userId) {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
        try {
            const response = await fetch(`${API_URL}/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': localStorage.getItem('token') },
            });

            if (!response.ok) throw new Error('Erreur lors de la suppression de l\'utilisateur');

            alert('Utilisateur supprimé avec succès !');
            loadUsers(); // Recharge la liste
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur :', error);
        }
    }
};

// Afficher le formulaire de modification dynamique dans le tableau
window.showEditForm = function (userId, name, firstname, email) {
    const row = document.querySelector(`[data-user-id="${userId}"]`);

    // Remplacer la ligne par un formulaire de modification
    row.innerHTML = `
        <td colspan="4">
            <form id="editUserForm">
                <label for="nameEdit">Nom :</label>
                <input type="text" id="nameEdit" value="${name}" required>

                <label for="firstnameEdit">Prénom :</label>
                <input type="text" id="firstnameEdit" value="${firstname}" required>

                <label for="emailEdit">Email :</label>
                <input type="email" id="emailEdit" value="${email}" required>

                <button type="submit" class="btn btn-primary">Modifier</button>
                <button type="button" class="btn btn-secondary" onclick="loadUsers()">Annuler</button>
            </form>
        </td>
    `;

    // Ajouter un écouteur pour gérer la soumission du formulaire de modification
    document.getElementById('editUserForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const updatedName = document.getElementById('nameEdit').value;
        const updatedFirstname = document.getElementById('firstnameEdit').value;
        const updatedEmail = document.getElementById('emailEdit').value;

        try {
            const response = await fetch(`${API_URL}/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token'),
                },
                body: JSON.stringify({ name: updatedName, firstname: updatedFirstname, email: updatedEmail }),
            });

            if (!response.ok) throw new Error('Erreur lors de la modification de l\'utilisateur');

            alert('Utilisateur modifié avec succès !');
            loadUsers(); // Recharge la liste
        } catch (error) {
            console.error('Erreur lors de la modification de l\'utilisateur :', error);
        }
    });
};

// Charger les utilisateurs au chargement de la page
window.onload = loadUsers;