document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const user = savedUser ? JSON.parse(savedUser) : null;
    if (!token || !user) {

        window.location.href = '/login.html';
        return;
    }
    const studentNameDisplay = document.getElementById('studentNameDisplay');
    const welcomeName = document.getElementById('welcomename');
    const logoutBtn = document.getElementById('logoutBtn');
    const joinOrgForm = document.getElementById('joinOrgForm');
    const orgCodeInput = document.getElementById('orgCode');
    const orgSection = document.getElementById('organizationSection');
    const JoinOrgSection = document.getElementById('joinOrgSection');
    if (studentNameDisplay) {
        const name = user.name || "student";
        studentNameDisplay.innerHTML = `<i class="bi bi-person-circle me-1"></i> ${name}`;
    }
    if (welcomeName) {
        welcomeName.textContent = user.name || "student";
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '../login.html';
        });
    }
    if (joinOrgForm && orgCodeInput) {
        joinOrgForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const orgCode = orgCodeInput.value.trim();
            // Handle organization joining logic here
            if (!orgCode) {
                Toastify({
                    text: "Please enter an organization code.",
                    duration: 2500,
                    gravity: "right",
                    style: {
                        background: "#ff2134ff",
                        borderRadius: "10px",
                    }

                }).showToast();
                return;

            }
            try {
                const response = await fetch(
                    'http://localhost:5000/api/students/join-organization',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ orgCode })
                    }
                );


                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Failed to join organization');
                }
                Toastify({
                    text: result.message,
                    duration: 2500,
                    gravity: "right",
                    position: "top",
                    style: {
                        background: "linear-gradient(to right, #00b09b, #96c93d)",
                    }
                }).showToast();
                JoinOrgSection.classList.add('d-none');
                orgSection.classList.remove('d-none');
                orgSection.innerHTML = `<div class="card shadow-sm border rounded-3 p-4">
                    <h4> Successfully joined organization</h4>
                    <p> Name :${result.organization.name}</p>
                    <p> Code: ${result.organization.join_code}</p></div>`;

            }
            catch (error) {
                console.log('join organization error:', error);
                Toastify({
                    text: error.message || "Failed to join organization",
                    duration: 2500,
                    gravity: "top",
                    position: "right",
                    style: {
                        background: "linear-gradient(to right, #ff5f6d, #ffc371)",
                    }
                }).showToast();
            }
        })

    };

});
