const token = localStorage.getItem('token');
const savedUser = localStorage.getItem('user');
const user = savedUser ? JSON.parse(savedUser) : null;

if (!token || !user) {
    window.location.href = '../login.html';
}

const urlParams = new URLSearchParams(window.location.search);
const organizationId = urlParams.get('id');

if (!organizationId) {
    window.location.href = 'student-dashboard.html';
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../login.html';
    });
}

const loadingIndicator = document.getElementById('loadingIndicator');
const createProjectCard = document.getElementById('createProjectCard');
const createProjectForm = document.getElementById('createProjectForm');
const createProjectBtn = document.getElementById('createProjectBtn');
const projectTitleInput = document.getElementById('projectTitle');
const groupNameInput = document.getElementById('groupName');
const projectDescInput = document.getElementById('projectDesc');

const projectDetailsCard = document.getElementById('projectDetailsCard');
const displayProjectTitle = document.getElementById('displayProjectTitle');
const displayGroupName = document.getElementById('displayGroupName');
const displayProjectDesc = document.getElementById('displayProjectDesc');
const inviteMembersBtn = document.getElementById('inviteMembersBtn');
const projectMembersList = document.getElementById('projectMembersList');

function showProjectDetails(project, isLeader, members) {
    if (!project) return;

    displayProjectTitle.textContent = project.project_title;
    displayGroupName.textContent = project.name;
    displayProjectDesc.textContent = project.description || 'No description provided.';

    // Show invite button only to leader
    if (isLeader) {
        inviteMembersBtn.classList.remove('d-none');
    } else {
        inviteMembersBtn.classList.add('d-none');
    }

    // Render group members with leader's name and roll no
    if (projectMembersList && Array.isArray(members)) {
        projectMembersList.innerHTML = members.map(m => `
            <div class="d-flex justify-content-between align-items-center p-2 border rounded-3 bg-light">
                <div>
                    <span class="fw-semibold">${m.name}</span>
                    ${m.rollno ? `<span class="text-muted small ms-2">(Roll No: ${m.rollno})</span>` : ''}
                </div>
                ${m.isLeader ? 'Leader' : 'Member'}
            </div>
        `).join('');
    }

    createProjectCard.classList.add('d-none');
    projectDetailsCard.classList.remove('d-none');
}

async function loadMyProject() {
    if (loadingIndicator) loadingIndicator.classList.remove('d-none');
    if (createProjectCard) createProjectCard.classList.add('d-none');
    if (projectDetailsCard) projectDetailsCard.classList.add('d-none');

    try {
        const response = await fetch(`http://localhost:5000/api/students/my-project/${organizationId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && result.success && result.hasProject) {
            showProjectDetails(result.project, result.isLeader, result.members);
        } else {
            createProjectCard.classList.remove('d-none');
        }
    } catch (err) {
        console.error('Failed to load project details:', err);
        createProjectCard.classList.remove('d-none');
    } finally {
        if (loadingIndicator) loadingIndicator.classList.add('d-none');
    }
}

if (createProjectForm) {
    createProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const projectTitle = projectTitleInput.value.trim();
        const groupName = groupNameInput.value.trim();
        const projectDesc = projectDescInput.value.trim();

        if (!projectTitle || !groupName) {
            Toastify({
                text: "Project title and group name are required.",
                duration: 2500,
                gravity: "top",
                position: "right",
                style: { background: "#ff2134ff", borderRadius: "10px" }
            }).showToast();
            return;
        }

        createProjectBtn.disabled = true;
        createProjectBtn.innerText = "Creating Project...";

        try {
            const response = await fetch('http://localhost:5000/api/students/create-project', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    organization_id: organizationId,
                    project_title: projectTitle,
                    group_name: groupName,
                    description: projectDesc
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                Toastify({
                    text: result.message || "Project created successfully!",
                    duration: 2500,
                    gravity: "top",
                    position: "right",
                    style: { background: "#00b09b", borderRadius: "10px" }
                }).showToast();

                showProjectDetails(result.group, result.isLeader, result.members);
            } else {
                Toastify({
                    text: result.message || "Failed to create project.",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "#ff2134ff", borderRadius: "10px" }
                }).showToast();

                createProjectBtn.disabled = false;
                createProjectBtn.innerText = "Create Project";
            }

        } catch (err) {
            console.error('Create project error:', err);
            Toastify({
                text: "Network error. Please try again.",
                duration: 3000,
                gravity: "top",
                position: "right",
                style: { background: "#ff2134ff", borderRadius: "10px" }
            }).showToast();

            createProjectBtn.disabled = false;
            createProjectBtn.innerText = "Create Project";
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadMyProject();
});
