const token = localStorage.getItem('token');
const savedUser = localStorage.getItem('user');
const user = savedUser ? JSON.parse(savedUser) : null;

if (!token || !user) {
    window.location.href = '../login.html';
}

const studentNameDisplay = document.getElementById('studentNameDisplay');
const welcomeName = document.getElementById('welcomename');

if (studentNameDisplay) {
    studentNameDisplay.innerHTML = `<i class="bi bi-person-circle me-1"></i> ${user.name || 'Student'}`;
}

if (welcomeName) {
    welcomeName.textContent = user.name || 'Student';
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../login.html';
    });
}

const joinOrgForm = document.getElementById('joinOrgForm');
const orgCodeInput = document.getElementById('orgCode');
const emptyState = document.getElementById('emptyState');
const orgContainer = document.getElementById('orgContainer');
const joinBtn = document.getElementById('joinBtn');


async function loadOrganizations() {
    try {
        const response = await fetch('http://localhost:5000/api/students/my-organizations', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            renderOrganizations(result.organizations);
        } else {
            console.error('Failed to load organizations:', result.message);
        }

    } catch (err) {
        console.error('Network error loading organizations:', err);
    }
}

// this code part renders org cards

function renderOrganizations(orgs) {
    // show empty state
    if (!orgs || orgs.length === 0) {
        emptyState.classList.remove('d-none');
        orgContainer.innerHTML = '';
        return;
    }

    emptyState.classList.add('d-none');

    // IMP
    orgContainer.innerHTML = orgs.map((org) => {
        return `
            <div class="col-12 col-md-6 col-lg-5">
                <div class="card h-100 shadow-sm border-0 rounded-3">
                    <div class="card-body d-flex flex-column">

                        <!-- Badge: Department & Academic Year -->
                        <div class="mb-2">
                                ${org.department} - ${org.academic_year}
                        </div>

                        <!-- Organization Name -->
                        <h5 class="card-title fw-bold text-dark mb-1">
                            ${org.name}
                        </h5>

                        <!-- Description -->
                        <p class="card-text text-muted small flex-grow-1">
                            ${org.description || 'No description provided.'}
                        </p>

                        <!-- Open Organization button -->
                        <a href="organization.html?id=${org.id}" class="btn btn-outline-primary btn-sm w-100 mt-2">
                            Open Organization <i class="bi bi-arrow-right ms-1"></i>
                        </a>

                    </div>
                </div>
            </div>
        `;
    }).join('');
}

if (joinOrgForm) {
    joinOrgForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const orgCode = orgCodeInput.value.trim();

        if (!orgCode) {
            Toastify({
                text: "Please enter an organization code.",
                duration: 2500,
                gravity: "top",
                position: "right",
                style: { background: "#ff2134ff", borderRadius: "10px" }
            }).showToast();
            return;
        }

        joinBtn.innerText = "Joining...";
        joinBtn.disabled = true;

        try {
            const response = await fetch('http://localhost:5000/api/students/join-organization', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orgCode })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                Toastify({
                    text: result.message || "Joined organization successfully!",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "#41ba00ff", borderRadius: "10px" }
                }).showToast();

                joinOrgForm.reset();

                loadOrganizations();

            } else {
                Toastify({
                    text: result.message || "Failed to join organization",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "#ff2134ff", borderRadius: "10px" }
                }).showToast();
            }

        } catch (err) {
            console.error("Error joining organization:", err);
            Toastify({
                text: "Could not connect to backend server.",
                duration: 3000,
                gravity: "top",
                position: "right",
                style: { background: "#ff2134ff", borderRadius: "10px" }
            }).showToast();

        } finally {
            joinBtn.innerText = "Join Organization";
            joinBtn.disabled = false;
        }
    });
}

loadOrganizations();
