const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', async (preventRelode) => {
    preventRelode.preventDefault();

const name = document.getElementById('name').value;
const email = document.getElementById('email').value;
const role = document.getElementById('role').value;
const rollno = document.getElementById('rollno').value;
const password = document.getElementById('password').value;
const confirmPassword = document.getElementById('confirmPassword').value;

if(password != confirmPassword) {
    
    Toastify({
        text: "passwords do not match",
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
            background: "#ff2134ff",
            borderRadius: "10px"
        }
    }).showToast();

    return;
}

const submitBtn = registerForm.querySelector('button[type="submit"]');
submitBtn.innerText = 'Creating account...';
submitBtn.disabled = true;

try{
const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        name, email, password, role, rollno
    })
});

const result = await response.json();

if(response.ok && result.success) {
    
    Toastify({
        text: result.message + ", Please Login!",
        duration: 2000,
        gravity: "top",
        position: "right",
        style: {
            background: "#41ba00ff",
            borderRadius: "10px"
        }
    }).showToast();

    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);

} else {
    Toastify({
    text: result.message,
    duration: 3000,
    gravity: "top",
    position: "right",
    style: {
        background: "#ff2134ff",
        borderRadius: "10px"
        }
    }).showToast();

}
} catch(err) {
    console.error('fetch error:', err);

    Toastify({
        text: "could not connect to backend",
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
            background: "#ff2134ff",
            borderRadius: "10px"
        }
    }).showToast();
    
} finally{
    submitBtn.innerText = 'Register';
    submitBtn.disabled = false;
}
});