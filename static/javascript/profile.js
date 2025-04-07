document.addEventListener("DOMContentLoaded", function () {
    let token = localStorage.getItem("token"); // Tokenni olish

    if (!token) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "You are not logged in!",
            confirmButtonText: "OK"
        }).then(() => {
            window.location.href = "login.html"; // Login sahifasiga yo'naltirish
        });
        return;
    }

    // Profil ma'lumotlarini olish
    fetch("https://5601-95-46-70-152.ngrok-free.app/api/profile/", {
        method: "GET",
        headers: {
            "Authorization": "Token " + token,
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch profile");
        }
        return response.json();
    })
    .then(data => {
        // Profil ma'lumotlarini HTML elementlariga joylash
        document.getElementById("username").textContent = data.username;
        document.getElementById("email").textContent = data.email;
    })
    .catch(error => {
        console.error("Error fetching profile:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to load profile. Please try again later.",
            confirmButtonText: "OK"
        });
    });
});