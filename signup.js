// ----- LIVE VALIDATION -----

function validateEmail() {
    const email = document.getElementById("email").value;
    const msg = document.getElementById("emailMsg");

    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.length === 0) {
        msg.innerHTML = "";
        return false;
    }

    if (pattern.test(email)) {
        msg.style.color = "lime";
        msg.innerHTML = "Looks good!";
        return true;
    } else {
        msg.style.color = "red";
        msg.innerHTML = "Invalid email format.";
        return false;
    }
}

function validatePassword() {
    const pass = document.getElementById("password").value;
    const msg = document.getElementById("passMsg");

    if (pass.length === 0) {
        msg.innerHTML = "";
        return false;
    }

    if (pass.length < 6) {
        msg.style.color = "orange";
        msg.innerHTML = "Too short (min 6 chars)";
        return false;
    } else {
        msg.style.color = "lime";
        msg.innerHTML = "Strong password";
        return true;
    }
}

function validateConfirm() {
    const pass = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;
    const msg = document.getElementById("confirmMsg");

    if (confirm.length === 0) {
        msg.innerHTML = "";
        return false;
    }

    if (confirm === pass) {
        msg.style.color = "lime";
        msg.innerHTML = "Matched ✓";
        return true;
    } else {
        msg.style.color = "red";
        msg.innerHTML = "Passwords do NOT match!";
        return false;
    }
}

// ----- SIGNUP FUNCTION -----

async function signup() {
    const emailOK = validateEmail();
    const passOK = validatePassword();
    const confirmOK = validateConfirm();

    if (!emailOK || !passOK || !confirmOK) {
        alert("Please fix the errors before submitting.");
        return;
    }

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("https://teamjal.onrender.com/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.success) {
            document.getElementById("popup").style.display = "flex";
        } else {
            alert(data.error || "Signup failed.");
        }

    } catch (err) {
        console.error(err);
        alert("Error connecting to server.");
    }
}

// ----- REDIRECT TO LOGIN -----

function goLogin() {
    window.location.href = "index.html";
}
