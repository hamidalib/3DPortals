document.getElementById("studentDataBtn").addEventListener("click", () => {
  // Show the Student Data module
  document.getElementById("studentDataModule").style.display = "block";
  document.getElementById("statsModule").style.display = "none";
  document.querySelector(".mainContent .header h1").textContent =
    "Student Data";

  // Set active state for buttons
  document.getElementById("studentDataBtn").classList.add("active");
  document.getElementById("statsModuleBtn").classList.remove("active");
});

document.getElementById("statsModuleBtn").addEventListener("click", () => {
  // Show the Stats module
  document.getElementById("studentDataModule").style.display = "none";
  document.getElementById("statsModule").style.display = "block";
  document.querySelector(".mainContent .header h1").textContent =
    "Student Stats";

  // Set active state for buttons
  document.getElementById("statsModuleBtn").classList.add("active");
  document.getElementById("studentDataBtn").classList.remove("active");
});
