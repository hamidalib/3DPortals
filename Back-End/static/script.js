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

// Get the form element
const studentForm = document.getElementById("studentForm");
const tableBody = document.querySelector("table tbody");
const searchInput = document.querySelector(".searchContainer input");

// Add these variables at the top of your script
const ITEMS_PER_PAGE = 10;
let currentPage = 1;
let totalPages = 1;
let allStudents = [];
let originalStudents = []; // Store original list of students

// Load existing students when page loads
async function loadStudents() {
  try {
    const response = await fetch("http://localhost:3000/api/students");
    allStudents = await response.json();
    originalStudents = [...allStudents]; // Keep a copy of original data

    if (allStudents.length === 0) {
      showNoDataMessage();
      return;
    }

    totalPages = Math.ceil(allStudents.length / ITEMS_PER_PAGE);
    displayStudents(currentPage);
    updatePagination();
  } catch (error) {
    console.error("Error loading students:", error);
  }
}

// Function to display students for current page
function displayStudents(page) {
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const studentsToShow = allStudents.slice(start, end);

  tableBody.innerHTML = ""; // Clear current table

  if (studentsToShow.length === 0) {
    showNoDataMessage();
    return;
  }

  studentsToShow.forEach((student, index) => {
    const globalIndex = start + index + 1; // Calculate global index
    const newRow = createTableRow(student, globalIndex);
    tableBody.appendChild(newRow);
  });
}

// Function to update pagination buttons
function updatePagination() {
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const pageNumbers = document.getElementById("pageNumbers");

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  // Update page numbers
  pageNumbers.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const pageNum = document.createElement("button");
    pageNum.className = `pageNum ${i === currentPage ? "active" : ""}`;
    pageNum.textContent = i;
    pageNum.onclick = () => {
      currentPage = i;
      displayStudents(currentPage);
      updatePagination();
    };
    pageNumbers.appendChild(pageNum);
  }
}

// Add event listeners for pagination buttons
document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayStudents(currentPage);
    updatePagination();
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    displayStudents(currentPage);
    updatePagination();
  }
});

// Create table row from student data
function createTableRow(student, index) {
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td>${index}</td>
    <td>${student.name}</td>
    <td>${student.age}</td>
    <td>${student.class}</td>
    <td>${student.group}</td>
    <td>${student.city}</td>
    <td>
      <button class="deleteBtn" data-id="${student._id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </td>
  `;

  // Add click event listener for delete button
  const deleteBtn = newRow.querySelector(".deleteBtn");
  deleteBtn.addEventListener("click", async () => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/students/${student._id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete student");
        }

        // Remove row from table
        newRow.remove();

        // Remove from allStudents array
        const index = allStudents.indexOf(student);
        if (index > -1) {
          allStudents.splice(index, 1);
        }

        // Show "No data found" if table is empty
        if (allStudents.length === 0) {
          showNoDataMessage();
        }

        // Update total pages
        totalPages = Math.ceil(allStudents.length / ITEMS_PER_PAGE);
        displayStudents(currentPage);
        updatePagination();
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to delete student");
      }
    }
  });

  return newRow;
}

// Update form submit handler
studentForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const studentData = {
    name: document.getElementById("name").value,
    age: document.getElementById("age").value,
    class: document.getElementById("class").value,
    group: document.getElementById("group").value,
    city: document.getElementById("city").value,
  };

  try {
    const response = await fetch("http://localhost:3000/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      throw new Error("Failed to save student");
    }

    const savedStudent = await response.json();

    // Update both arrays
    allStudents.unshift(savedStudent);
    originalStudents.unshift(savedStudent);

    // Update total pages
    totalPages = Math.ceil(allStudents.length / ITEMS_PER_PAGE);

    // Go to first page to show new entry
    currentPage = 1;
    displayStudents(currentPage);
    updatePagination();

    // Reset the form
    studentForm.reset();
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to save student");
  }
});

// Update search functionality
searchInput.addEventListener("input", function (e) {
  const searchTerm = e.target.value.toLowerCase().trim();

  if (searchTerm === "") {
    // Reset to original data
    allStudents = [...originalStudents];
  } else {
    // Filter based on search term
    allStudents = originalStudents.filter((student) =>
      student.name.toLowerCase().includes(searchTerm)
    );
  }

  // Update pagination
  totalPages = Math.ceil(allStudents.length / ITEMS_PER_PAGE);
  currentPage = 1; // Reset to first page

  if (allStudents.length === 0) {
    showNoDataMessage();
  } else {
    displayStudents(currentPage);
  }
  updatePagination();
});

function showNoDataMessage() {
  const existingNoData = tableBody.querySelector(".no-data");
  if (existingNoData) {
    existingNoData.remove();
  }

  const noDataRow = document.createElement("tr");
  noDataRow.className = "no-data";
  noDataRow.innerHTML = "<td colspan='7'>No data found!</td>";
  tableBody.appendChild(noDataRow);
}

// Load students when page loads
loadStudents();

// Add this after your existing code
const fileUpload = document.getElementById("fileUpload");

fileUpload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://localhost:3000/api/students/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    const newStudents = await response.json();

    // Remove "No data found" message if it exists
    const noDataRow = tableBody.querySelector(".no-data");
    if (noDataRow) {
      noDataRow.remove();
    }

    // Add new students to table
    newStudents.forEach((student) => {
      const newRow = createTableRow(student, allStudents.length + 1);
      tableBody.insertBefore(newRow, tableBody.firstChild);
      allStudents.unshift(student);
    });

    // Reset file input
    fileUpload.value = "";

    // Update total pages
    totalPages = Math.ceil(allStudents.length / ITEMS_PER_PAGE);
    displayStudents(currentPage);
    updatePagination();

    alert("File uploaded successfully!");
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to upload file");
  }
});

// Add this event listener for the sign out button
document.querySelector(".signOutWrap button").addEventListener("click", () => {
  // Clear stored tokens
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");

  // Redirect to login page
  window.location.href = "index.html";
});
