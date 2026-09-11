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
    alert('passwords do not match');
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
    alert(result.message)
    window.location.href = 'login.html';
} else {
    alert('registration failed' + result.message);
}
} catch(err) {
    console.error('fetch error:', err);
    alert('could not connect to backend!');
} finally{
    submitBtn.innerText = 'Register';
    submitBtn.disabled = false;
}
});