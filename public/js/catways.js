console.log('catways.js chargé avec succès');
const API_URL = 'http://localhost:3000/api/catways';

// Ajouter un nouveau catway
window.addCatway = async function (event) {
    event.preventDefault();
    const catwayNumber = document.getElementById('catwayNumber').value;
    const catwayType = document.getElementById('catwayType').value;
    const catwayState = document.getElementById('catwayState').value;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: localStorage.getItem('token'),
            },
            body: JSON.stringify({ catwayNumber, catwayType, catwayState }),
        });

        if (response.ok) {
            alert('Catway ajouté avec succès !');
            location.reload();
        } else {
            const error = await response.json();
            alert('Erreur : ' + error.message);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout du catway :', error);
    }
};

// Supprimer un catway
window.deleteCatway = async function (catwayNumber) {
    if (confirm('Voulez-vous vraiment supprimer ce catway ?')) {
        try {
            const response = await fetch(`${API_URL}/${catwayNumber}`, {
                method: 'DELETE',
                headers: {
                    Authorization: localStorage.getItem('token'),
                },
            });

            if (response.ok) {
                alert('Catway supprimé avec succès !');
                location.reload();
            } else {
                const error = await response.json();
                alert('Erreur : ' + error.message);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du catway :', error);
        }
    }
};

// Basculer l'affichage du formulaire d'édition
window.toggleEditForm = function (catwayNumber) {
    const row = document.getElementById(`editRow-${catwayNumber}`);
    row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
};

// Modifier un catway
window.updateCatway = async function (event, catwayNumber) {
    event.preventDefault();
    const catwayState = document.getElementById(`editCatwayState-${catwayNumber}`).value;

    try {
        const response = await fetch(`${API_URL}/${catwayNumber}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: localStorage.getItem('token'),
            },
            body: JSON.stringify({ catwayState }),
        });

        if (response.ok) {
            alert('Catway modifié avec succès !');
            location.reload();
        } else {
            const error = await response.json();
            alert('Erreur : ' + error.message);
        }
    } catch (error) {
        console.error('Erreur lors de la modification du catway :', error);
    }
};