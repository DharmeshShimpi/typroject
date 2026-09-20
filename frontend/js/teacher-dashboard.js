
// this reads the token stored in the localstorage in browser to verify the user is authenticated or not
const token = localStorage.getItem('token');

// if there is no token, then this means user is not authenticated. Then it redirects user back to login page
if(!token) {
    window.location.href = 'login.html';
}

// why did we do this? because in the browser - anyone can type the url manually like teacher-dashboard.html and access the page. This check prevents unauthorized users from seeing the dashboard

// next


// storing form data in createOrgForm variable. see in form we have given id="createOrgForm"
const createOrgForm = document.getElementById('createOrgForm');

// using emptyState var to store empty state card, see we have given there id="emptyState"
const emptyState = document.getElementById('emptyState');

// storing var to dynamically render cards
const orgContainer = document.getElementById('orgContainer');

// now we will fetch the data from backend
async function loadOrganizations() {
    try {
        const response = await fetch("http://localhost:5000/api/organizations", {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

    // storing response in result
    const result = await response.json();

    if(response.ok && result.success) {
        renderOrganizations(result.organizations);// renderOrganizations function is called with organizations which we're getting from backend.
    } else {
        console.error("Failed to load organizations:", result.message);
    } 

    } catch(err) { // in case network is not working, catch will throw error
        console.error("Could not load organizations:", err);
    }
}

function renderOrganizations(orgs) {
    if(!orgs || orgs.length === 0) {
        emptyState.classList.remove('d-none')

        orgContainer.innerHTML = '';

        return;
    }

    emptyState.classList.add('d-none');

    orgContainer.innerHTML = orgs.map((org) => {
        return `
        <div class="col-12 col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm border-0 rounded-3">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            ${org.academic_year} ${org.department}
                        </div

                        <div>
                            Organization Code: ${org.join_code}
                        </div>
                        <h5 class="card-title fw-bold text-dark mb-1">
                            ${org.name}
                        </h5>

                        <p class="card-text text-muted small flex-grow-1">
                            ${org.description}
                        </p>

                        <div class="text-muted small mb-3">
                            Group Size: ${org.min_members} - ${org.max_members} members
                        </div>
                        
                        <a href="organization.html?id=${org.id}" class="btn btn-primary btn-sm w-100">
                            Open Organization <i class="bi bi-arrow-right ms-1"></i>
                        </a>


                    </div>

                    
                </div>
            </div>
        </div>
        `
    }).join('')
}

// create a new organization on form submit

createOrgForm.addEventListener('submit', async (preventRelode) => {
    preventRelode.preventDefault();

    const name = document.getElementById('orgName').value.trim();
    const description = document.getElementById('orgDesc').value.trim();
    const department = document.getElementById('orgDept').value;
    const academicYear = document.getElementById('orgYear').value;
    const minMembers = document.getElementById('minMembers').value;
    const maxMembers = document.getElementById('maxMembers').value;

    // validation: min members cannot be greater than max members

    if(Number(minMembers) > Number(maxMembers)) {
        alert("Minimum members cannot be greater than Maximum members!");
        return;
    }

    // change submit button to Creating... and diable the button
    const submitBtn = createOrgForm.querySelector('button[type="submit"]');
    submitBtn.innerText = "Creating...";
    submitBtn.disabled = true;


    try {
        const response = await fetch('http://localhost:5000/api/organizations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name, description, department, academicYear, minMembers, maxMembers
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            createOrgForm.reset();

            // Close the modal popup
            const orgModal = document.getElementById('createOrgModal');
            const modalInstance = bootstrap.Modal.getOrCreateInstance(orgModal);
            modalInstance.hide();

            loadOrganizations();
        } else {
            alert('Failed to create organization: ' + result.message);
        }


    } catch (err) {
        console.error('Error creating organization:', err);
        alert('Could not connect to the backend server.');
    } finally {
        submitBtn.innerText = 'Create';
        submitBtn.disabled = false;
    }
});

loadOrganizations();

