document.addEventListener("DOMContentLoaded", async () => {
    console.log("✅ menu.js chargé avec succès.");

    // 📌 Vérifier si un token est passé dans l'URL après connexion
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
        console.log("🔑 Token récupéré depuis l'URL :", token);
        localStorage.setItem("token", `Bearer ${token}`); // ✅ Stocke dans localStorage
        history.replaceState(null, "", window.location.pathname); // ✅ Nettoie l'URL pour éviter ?token=xxx
    }

    console.log("📢 Token actuel dans localStorage :", localStorage.getItem("token"));

    const menuToggle = document.getElementById("menuToggle");
    const closeMenu = document.getElementById("closeMenu");
    const sideMenu = document.getElementById("sideMenu");
    const reservationsTable = document.getElementById("reservationsTable").querySelector("tbody");
    const currentDateElement = document.getElementById("currentDate");

    console.log("✅ menu.js chargé avec succès.");

    // 🔹 Fonction pour récupérer le token
    function getToken() {
        console.log("📢 Vérification du token...");

        // Récupère d'abord depuis localStorage
        let token = localStorage.getItem("token");
        if (token) {
            console.log("🔑 Token récupéré depuis localStorage :", token);
            return token;
        }

        // Si non trouvé, essaie depuis les cookies
        const cookies = document.cookie.split("; ");
        for (let i = 0; i < cookies.length; i++) {
            const [key, value] = cookies[i].split("=");
            if (key === "authToken") {
                token = decodeURIComponent(value);
                console.log("🔑 Token récupéré depuis les cookies :", token);
                return token;
            }
        }

        console.warn("⚠️ Aucun token trouvé !");
        return null;
    }

    // 🔹 Stocker le token après connexion
    async function storeTokenAfterLogin() {
        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                console.log("✅ Connexion réussie. Token reçu :", data.token);
                localStorage.setItem("token", data.token); // ✅ Stocke le token
                window.location.href = "/"; // Redirige vers l'accueil
            } else {
                console.error("❌ Erreur de connexion :", data.error);
            }
        } catch (error) {
            console.error("❌ Erreur réseau lors de la connexion :", error);
        }
    }

    // 🔹 Ouvrir le menu latéral
    menuToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        console.log("📌 Bouton menu cliqué");

        if (!sideMenu.classList.contains("active")) {
            sideMenu.classList.add("active");
            console.log("📂 Menu ouvert");

            loadReservations(); // Charger les réservations dynamiquement
            showCurrentDate(); // Afficher la date du jour
        }
    });

    // 🔹 Fermer le menu latéral
    closeMenu.addEventListener("click", () => {
        console.log("❌ Fermeture du menu");
        sideMenu.classList.remove("active");
    });

    // 🔹 Fermer le menu si on clique en dehors
    document.addEventListener("click", (event) => {
        if (!sideMenu.contains(event.target) && event.target !== menuToggle) {
            console.log("❌ Clic en dehors du menu, fermeture");
            sideMenu.classList.remove("active");
        }
    });

    // 🔹 Empêcher la fermeture si on clique à l'intérieur du menu
    sideMenu.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    // 🔹 Fonction pour afficher la date du jour
    function showCurrentDate() {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = `📅 ${today.toLocaleDateString('fr-FR', options)}`;
        console.log("📅 Date actuelle affichée :", currentDateElement.textContent);
    }

    // 🔹 Fonction pour charger les réservations depuis l'API
    async function loadReservations() {
        reservationsTable.innerHTML = "<tr><td colspan='3'>Chargement...</td></tr>";

        try {
            const token = getToken();
            console.log("🔑 Token utilisé pour récupérer les réservations :", token);

            if (!token) {
                console.error("⚠️ Aucune authentification détectée.");
                reservationsTable.innerHTML = "<tr><td colspan='3'>Utilisateur non authentifié</td></tr>";
                return;
            }

            const response = await fetch("/api/reservations", {
                method: "GET",
                credentials: "include", // ✅ Envoie les cookies
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("❌ Erreur lors du chargement des réservations");

            const reservations = await response.json();
            reservationsTable.innerHTML = ""; // Vide le tableau avant d'ajouter les nouvelles réservations
            console.log("📊 Réservations récupérées :", reservations);

            if (reservations.length === 0) {
                reservationsTable.innerHTML = "<tr><td colspan='3'>Aucune réservation en cours</td></tr>";
            } else {
                reservations.forEach(reservation => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${reservation.clientName || "Inconnu"}</td>
                        <td>${new Date(reservation.startDate).toLocaleDateString()}</td>
                        <td>${new Date(reservation.endDate).toLocaleDateString()}</td>
                    `;
                    reservationsTable.appendChild(row);
                });
            }
        } catch (error) {
            console.error("❌ Erreur lors du chargement des réservations :", error);
            reservationsTable.innerHTML = "<tr><td colspan='3'>Erreur de chargement</td></tr>";
        }
    }
});
