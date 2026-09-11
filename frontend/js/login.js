const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (preventRelode) => {
    preventRelode.preventDefault();

const email = document.getElementById('email').value;
const password = document.getElementById('password').value;

const submitBtn = loginForm.querySelector('button[type="submit"]');
submitBtn.innerText = 'Logging in...';
submitBtn.disabled = true;

try {

    const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email,password})
    });

    const result = await response.json();

    if(response.ok && result.success) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        alert("login success")
        window.location.href = 'index.html';
    } else {
        alert('Login failed!')
    }
} catch (err) {
    console.error('login error:', err);
    alert('could not connect to backend');
} finally {
    submitBtn.innerText = 'Login';
    submitBtn.disabled = false;
}
});