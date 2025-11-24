// Redirect to login if no token found
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {

            localStorage.removeItem("token");
            localStorage.clear();

            setTimeout(() => {
                window.location.href = "Front.html";
            }, 50);
        });
    }

    loadData();
});

async function loadData() {
    try {
        const res = await fetch("https://teamjal.onrender.com/sensor-data", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            throw new Error("Server Error");
        }

        const data = await res.json();

        if (data.length > 0) {
            // FIXED — using value instead of flow
            document.getElementById("flow-rate").textContent = data[0].value + " L/min";
            document.getElementById("leak-status").textContent = data[0].leak ? "Leak" : "OK";
            document.getElementById("timestamp").textContent = new Date(data[0].time).toLocaleString();
        }

        const table = document.getElementById("table-body");
        table.innerHTML = "";

        data.forEach((item) => {
            const rowClass = item.leak ? "leak-row" : "ok-row";

            // FIXED — using item.value
            table.innerHTML += `
                <tr class="${rowClass}">
                    <td>${item.value}</td>
                    <td>${item.leak ? "Leak" : "OK"}</td>
                    <td>${new Date(item.time).toLocaleString()}</td>
                </tr>
            `;
        });

        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) logoutBtn.style.display = "block";

    } catch (err) {
        console.log(err);
        alert("Server Error — check backend");
    }
}
