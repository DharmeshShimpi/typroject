
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const user = savedUser ? JSON.parse(savedUser) : null;
    //if no token or user found
    if (!token || !user) {
        window.location.href = '/login.html';
        return;
    }
    //dom elements
    const studentNameDisplay = document.getElementById('studentNameDisplay');
    const welcomeName = document.getElementById('welcomename');
    const logoutBtn = document.getElementById('logoutBtn');
    const joinOrgForm = document.getElementById('joinOrgForm');
    const orgCodeInput = document.getElementById('orgCode');
    const orgSection = document.getElementById('organizationSection');
    const joinOrgSection = document.getElementById('joinOrgSection');
    if (studentNameDisplay) {
        const name = user.name || 'student';
        studentNameDisplay.innerHTML = `<i class="bi bi-person-circle me-1></i>`
    }
    if (welcomeName) {
        welcomeName.textContent = user.name || "student";
    }
    if (logoutBtn) {//login btn
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '../login.html';
        });
    }
    const loadOrganizations = async () => {//load join organization
        try {
            const response = await fetch('http://localhost:5000/api/students/my-organizations', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to fetch organizations');
            }
            //if student no organization yet
            if (result.organizations.length === 0) {
                return;

            }
            joinOrgSection.classList.add('d-none');
            orgSection.classList.remove('d-none');
            //show organization card with view button
            orgSection.innerHTML = result.organizations.map((organization) => `
<div class="card shadow-sm border rounded-3 p-4 mb-3">
<h4>${organization.name}</h4><button class="btn btn-outline-primary btn-sm"
data-org-id="${organization.id}"data-action="view-org"> View Details </button>
<p> Department :${organization.department}</p>
<p> Academic Year:${organization.academic_year}</p>
<p> Code:${organization.join_code}</p></div>
`).join('');
            // Add click event to each "View Details" button
            document.querySelectorAll('[data-action="view-org"]').forEach((button) => {
                button.addEventListener('click', async () => {
                    const organizationId = button.dataset.orgId;
                    try {
                        const response = await fetch(
                            `http://localhost:5000/api/students/organizations/${organizationId}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        );
                        const result = await response.json();
                        if (!response.ok || !result.success) {
                            throw new Error(
                                result.message || "Failed to load organization details"
                            );
                        }
                        const { organization, members } = result;
                        const memberList = Array.isArray(members) ? members : [];
                        orgSection.innerHTML = `
    <div class="card shadow-sm border rounded-3 p-4">
        <h4 class="mb-2">${organization.name}</h4>
        <p class="mb-1"><strong>Description:</strong> ${organization.description || 'No description available'}</p>
        <p class="mb-1"><strong>Department:</strong> ${organization.department}</p>
        <p class="mb-1"><strong>Academic Year:</strong> ${organization.academic_year}</p>
        <p class="mb-1"><strong>Join Code:</strong> ${organization.join_code}</p>
        <p class="mb-2"><strong>Max Members:</strong> ${organization.max_members}</p>

        <h5>Members</h5>
        ${memberList.length
                                ? `<ul class="mb-0 ps-3">
                    ${memberList.map((member) => `
                        <li>Student ID: ${member.student_id}</li>
                    `).join('')}
                </ul>`
                                : "<p class='text-muted mb-0'>No members yet.</p>"
                            }
    </div>
`;
                    } catch (error) {
                        console.error('View org details error:', error);

                        Toastify({
                            text: error.message || "Failed to load details",
                            duration: 2500,
                            gravity: "top",
                            position: "right",
                            style: {
                                background: "linear-gradient(to right, #ff5f6d, #ffc371)",
                            }
                        }).showToast();
                    }
                });
            });
        }
        catch (error) {
            console.error('load organization error:', error);
        }
    };
    //cal function on page load
    await loadOrganizations();
    //join organization form
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
                joinOrgSection.classList.add('d-none');
                orgSection.classList.remove('d-none');
                orgSection.innerHTML = `<div class="card shadow-sm border rounded-3 p-4">
                    <h4> Successfully joined organization</h4>
                    <p> Name :${result.organization.name}</p>
                    <p> Code: ${result.organization.join_code}</p></div>`;
                //after successfull login,reload organization list
                await loadOrganizations();
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
