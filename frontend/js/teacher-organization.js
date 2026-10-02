const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');
const organizationId = new URLSearchParams(location.search).get('id');

const loading = document.getElementById('loadingState');
const error = document.getElementById('errorState');
const page = document.getElementById('organizationPage');

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.href = '../login.html';
});

function safe(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
}

async function loadOverview() {
    if (!token || user?.role !== 'teacher') {
        location.href = '../login.html';
        return;
    }

    if (!organizationId) {
        error.textContent = 'Organization ID is missing.';
        error.classList.remove('d-none');
        loading.classList.add('d-none');
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:5000/api/organizations/${encodeURIComponent(organizationId)}/overview`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Could not load organization.');
        }

        const { organization, students = [], groups = [], stats = {} } = result;

        document.getElementById('organizationName').textContent = organization.name;
        document.getElementById('organizationMeta').textContent =
            `${organization.academic_year} · ${organization.department}`;
        document.getElementById('organizationDescription').textContent =
            organization.description || 'No description provided.';
        document.getElementById('organizationCode').textContent = organization.join_code;

        document.getElementById('studentCount').textContent = stats.studentCount ?? students.length;
        document.getElementById('groupCount').textContent = stats.groupCount ?? groups.length;
        document.getElementById('unassignedCount').textContent = stats.studentsWithoutGroup ?? 0;
        document.getElementById('groupsLabel').textContent = `${groups.length} groups`;
        document.getElementById('studentsLabel').textContent = `${students.length} students`;

        document.getElementById('groupsList').innerHTML = groups.length
            ? groups.map(group => `
                <article class="group-panel">
                    <h3>${safe(group.name)}</h3>
                    <p>${(group.members || []).length} students</p>
                    ${(group.members || []).map(member =>
                `<div class="group-member">${safe(member.name)} · ${safe(member.rollno || '')}</div>`
            ).join('')}
                </article>
            `).join('')
            : '<p>No groups yet.</p>';

        const groupNames = new Map();
        groups.forEach(group => (group.members || []).forEach(member => {
            groupNames.set(member.id, group.name);
        }));

        document.getElementById('studentsTableBody').innerHTML = students.length
            ? students.map(student => `
                <tr>
                    <td>${safe(student.name)}</td>
                    <td>${safe(student.rollno || '—')}</td>
                    <td>${safe(groupNames.get(student.id) || 'Not assigned')}</td>
                    <td>${student.joinedAt ? new Date(student.joinedAt).toLocaleDateString() : '—'}</td>
                </tr>
            `).join('')
            : '<tr><td colspan="4">No students have joined yet.</td></tr>';

        loading.classList.add('d-none');
        page.classList.remove('d-none');
    } catch (err) {
        loading.classList.add('d-none');
        error.textContent = err.message || 'Could not connect to the backend.';
        error.classList.remove('d-none');
    }
}

loadOverview();