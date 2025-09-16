// ===============================
// MARKETPLACE AUTHENTICATION
// ===============================

// ---------- SIGN-UP ----------
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.onsubmit = (e) => {
    e.preventDefault();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const role = document.getElementById('signupRole').value;
    const position = document.getElementById('signupPosition') 
                      ? document.getElementById('signupPosition').value 
                      : role;

    let users = JSON.parse(localStorage.getItem("users") || "[]");

    // check if email already exists
    if (users.find(u => u.email === email)) {
      const msg = document.getElementById('signupMsg');
      msg.textContent = "⚠️ Email already exists!";
      msg.classList.remove("hidden");
      return;
    }

    const newUser = {
      id: "u" + Date.now(),
      name,
      email,
      password,
      role,
      position,
      freeTrialCount: 0
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    const msg = document.getElementById('signupMsg');
    msg.textContent = "✅ Account created successfully! You can now login.";
    msg.classList.remove("hidden");

    signupForm.reset();
  };
}

// ---------- LOGIN ----------
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.onsubmit = (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const role = document.getElementById('loginRole').value;
    const errorBox = document.getElementById('loginError');

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(u => u.email === email && u.password === password && u.role === role);

    if (!user) {
      errorBox.textContent = "❌ Invalid login details!";
      errorBox.classList.remove("hidden");
      return;
    }

    // Save current session
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Redirect based on role
    if (role === "farmer") {
      window.location = "farmer-dashboard.html";
    } else {
      window.location = "buyer-dashboard.html";
    }
  };
}

// ---------- LOGOUT ----------
function logout() {
  localStorage.removeItem("currentUser");
  window.location = "index.html";
}

// Make logout available globally
window.logout = logout;
