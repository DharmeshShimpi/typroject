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
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));

            //toast notification from toastify
            Toastify({ // so this all is a object. like key value pairs. very simple
                text: "login success",
                duration: 2000, // means 2000ms ~ 2 seconds
                gravity: "top",
                position: "right",
                style: {
                    background: "#41ba00ff",
                    borderRadius: "10px"
                }
            }).showToast();


            setTimeout(() => {
                if (result.user.role === "teacher") {
                    window.location.href = "teacher-dashboard.html";
                } else if (result.user.role === "student") {
                    window.location.href = "./student/student-dashboard.html";
                }
            }, 2000);

        } else {
            Toastify({
                text: "login failed: " + result.message,
                duration: 3000,
                gravity: "top",
                position: "right",
                style: {
                    background: "#ff2134ff",
                    borderRadius: "10px"
                }
            }).showToast();
        }
    } catch (err) {
        console.error('login error:', err);

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

    } finally {
        submitBtn.innerText = 'Login';
        submitBtn.disabled = false;
    }
});