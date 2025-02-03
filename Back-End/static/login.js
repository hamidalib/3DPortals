document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const remember = document.getElementById("remember").checked;

  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await response.json();

    // Store the token
    if (remember) {
      localStorage.setItem("token", data.token);
    } else {
      sessionStorage.setItem("token", data.token);
    }

    // Redirect to main page
    window.location.href = "homepage.html";
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});
