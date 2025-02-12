console.log("✅ reservations.js chargé avec succès");
const API_URL = "http://localhost:3000/api/reservations";

console.log("🔍 Token depuis localStorage sur la page réservations :", localStorage.getItem("token"));
console.log("🔍 Cookies disponibles :", document.cookie);

// Charger les réservations existantes
window.loadReservations = async function () {
    try {
        console.log("--- Début de la récupération des réservations ---");
        
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("⚠️ Aucun token trouvé, utilisateur non authentifié !");
            return;
        }

        const response = await fetch(API_URL, {
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("⚠️ Erreur lors de la récupération des réservations :", error);
            return;
        }

        const reservations = await response.json();
        console.log("✅ Réservations récupérées :", reservations);

        const tableBody = document.getElementById("reservationsTableBody");
        tableBody.innerHTML = ""; // Réinitialise le tableau

        reservations.forEach((reservation) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${reservation.catwayNumber || "Inconnu"}</td>
                <td>${reservation.clientName || "Inconnu"}</td>
                <td>${reservation.boatName || "Inconnu"}</td>
                <td>${reservation.startDate ? new Date(reservation.startDate).toLocaleDateString() : "Inconnue"}</td>
                <td>${reservation.endDate ? new Date(reservation.endDate).toLocaleDateString() : "Inconnue"}</td>
                <td>
                    <button class="btn btn-delete" onclick="deleteReservation('${reservation._id}')">Supprimer</button>
                    <button class="btn btn-edit" onclick="toggleEditForm('${reservation._id}', '${reservation.catwayNumber}', '${reservation.clientName}', '${reservation.boatName}', '${reservation.startDate}', '${reservation.endDate}')">Modifier</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        console.log("--- Fin de la récupération des réservations ---");
    } catch (error) {
        console.error("⚠️ Erreur lors du chargement des réservations :", error);
    }
};

// 🔹 Afficher/Masquer le formulaire de modification
window.toggleEditForm = function (reservationId, catwayNumber, clientName, boatName, startDate, endDate) {
    console.log(`✏️ Modification de la réservation ID: ${reservationId}`);
    
    let editRow = document.getElementById(`editRow-${reservationId}`);
    
    if (!editRow) {
        console.warn("⚠️ Le formulaire de modification n'existe pas, création dynamique...");
        
        editRow = document.createElement("tr");
        editRow.id = `editRow-${reservationId}`;
        editRow.innerHTML = `
            <td colspan="6">
                <form id="editReservationForm-${reservationId}" onsubmit="editReservation(event, '${reservationId}')">
                    <label for="editCatwayNumber-${reservationId}">Numéro du catway :</label>
                    <input type="number" id="editCatwayNumber-${reservationId}" value="${catwayNumber}" required>

                    <label for="editClientName-${reservationId}">Nom du client :</label>
                    <input type="text" id="editClientName-${reservationId}" value="${clientName}" required>

                    <label for="editBoatName-${reservationId}">Nom du bateau :</label>
                    <input type="text" id="editBoatName-${reservationId}" value="${boatName}" required>

                    <label for="editStartDate-${reservationId}">Date de début :</label>
                    <input type="date" id="editStartDate-${reservationId}" value="${new Date(startDate).toISOString().split('T')[0]}" required>

                    <label for="editEndDate-${reservationId}">Date de fin :</label>
                    <input type="date" id="editEndDate-${reservationId}" value="${new Date(endDate).toISOString().split('T')[0]}" required>

                    <button type="submit">Enregistrer</button>
                    <button type="button" onclick="toggleEditForm('${reservationId}')">Annuler</button>
                </form>
            </td>
        `;
        document.getElementById("reservationsTableBody").appendChild(editRow);
    }
    
    editRow.style.display = "table-row"; // ✅ Forcer l'affichage
};

// 🔹 Modifier une réservation
window.editReservation = async function (event, reservationId) {
    event.preventDefault();
    console.log(`✏️ Tentative de modification de la réservation ID: ${reservationId}`);

    const updatedData = {
        catwayNumber: document.getElementById(`editCatwayNumber-${reservationId}`).value,
        clientName: document.getElementById(`editClientName-${reservationId}`).value,
        boatName: document.getElementById(`editBoatName-${reservationId}`).value,
        startDate: document.getElementById(`editStartDate-${reservationId}`).value,
        endDate: document.getElementById(`editEndDate-${reservationId}`).value,
    };

    try {
        const response = await fetch(`${API_URL}/${reservationId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token"),
            },
            body: JSON.stringify(updatedData),
        });

        if (response.ok) {
            console.log("✅ Réservation modifiée avec succès !");
            location.reload();
        } else {
            console.error("⚠️ Erreur lors de la modification !");
        }
    } catch (error) {
        console.error("❌ Erreur :", error);
    }
};

// 🔹 Supprimer une réservation
window.deleteReservation = async function (reservationId) {
    if (confirm("Voulez-vous vraiment supprimer cette réservation ?")) {
        try {
            const response = await fetch(`${API_URL}/${reservationId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": localStorage.getItem("token"),
                },
            });

            if (response.ok) {
                console.log("✅ Réservation supprimée avec succès !");
                location.reload();
            } else {
                console.error("⚠️ Erreur lors de la suppression !");
            }
        } catch (error) {
            console.error("❌ Erreur :", error);
        }
    }
};

// 🔹 Ajouter une nouvelle réservation
document.getElementById("addReservationForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const catwayNumber = document.getElementById("catwayNumber").value;
    const clientName = document.getElementById("clientName").value;
    const boatName = document.getElementById("boatName").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    console.log("➕ Tentative d'ajout de réservation :", { catwayNumber, clientName, boatName, startDate, endDate });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token"),
            },
            body: JSON.stringify({ catwayNumber, clientName, boatName, startDate, endDate }),
        });

        if (response.ok) {
            console.log("✅ Réservation ajoutée avec succès !");
            location.reload();
        } else {
            console.error("⚠️ Erreur lors de l'ajout de la réservation !");
        }
    } catch (error) {
        console.error("❌ Erreur :", error);
    }
});

// Charger les réservations au chargement de la page
window.onload = loadReservations;
