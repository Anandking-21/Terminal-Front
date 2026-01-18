/* Front.js — Authentication + Real-Time IoT Data */

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

    // Initialize data loading
    loadData();
    
    // Auto-refresh every 200ms to maintain 5Hz frequency
    setInterval(loadData, 200); 
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
            const latest = data[0];
            
            // Syncing with your ESP32 JSON keys: "flow" and "status"
            const flowRate = latest.flow !== undefined ? latest.flow : latest.value;
            const currentStatus = latest.status || (latest.leak ? "Leak" : "OK");

            // Update KPI Display
            const flowEl = document.getElementById("flow-rate");
            const statusEl = document.getElementById("leak-status");
            const timeEl = document.getElementById("timestamp");

            if (flowEl) flowEl.textContent = flowRate.toFixed(2) + " L/min";
            
            if (statusEl) {
                statusEl.textContent = currentStatus;
                // Apply Red Light Logic for status color
                statusEl.style.color = currentStatus === "Leak" ? "#ff4d4d" : "#00f6ff";
            }

            if (timeEl) {
                timeEl.textContent = latest.time ? new Date(latest.time).toLocaleString() : new Date().toLocaleTimeString();
            }

            // Update History Table
            const table = document.getElementById("table-body");
            if (table) {
                table.innerHTML = "";
                // Show only last 10 records for better performance at 5Hz
                data.slice(0, 10).forEach((item) => {
                    const rowFlow = item.flow !== undefined ? item.flow : item.value;
                    const rowStatus = item.status || (item.leak ? "Leak" : "OK");
                    const rowClass = rowStatus === "Leak" ? "leak-row" : "ok-row";

                    table.innerHTML += `
                        <tr class="${rowClass}">
                            <td>${rowFlow.toFixed(2)}</td>
                            <td style="color: ${rowStatus === 'Leak' ? '#ff4d4d' : 'inherit'}">${rowStatus}</td>
                            <td>${new Date(item.time).toLocaleString()}</td>
                        </tr>
                    `;
                });
            }
        }

        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) logoutBtn.style.display = "block";

    } catch (err) {
        console.log("Fetch Error:", err);
    }
}
