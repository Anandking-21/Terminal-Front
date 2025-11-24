const backendURL = "https://teamjal.onrender.com";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    try {
        const res = await fetch(`${backendURL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            errorMessage.textContent = data.message || "Login failed";
            return;
        }

        // Save token
        localStorage.setItem("token", data.token);

        // Redirect to homepage
        window.location.href = "index.html";

    } catch (error) {
        errorMessage.textContent = "Error connecting to server";
    }
});
