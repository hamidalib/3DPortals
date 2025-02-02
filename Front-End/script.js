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

// Store all table rows for filtering
let allTableRows = [];

// Load existing students when page loads
async function loadStudents() {
  try {
    const response = await fetch("http://localhost:3000/api/students");
    const students = await response.json();

    if (students.length === 0) {
      showNoDataMessage();
      return;
    }

    // Remove "No data found" message if it exists
    const noDataRow = tableBody.querySelector(".no-data");
    if (noDataRow) {
      noDataRow.remove();
    }

    // Add each student to the table
    students.forEach((student) => {
      const newRow = createTableRow(student);
      tableBody.appendChild(newRow);
      allTableRows.push(newRow);
    });
  } catch (error) {
    console.error("Error loading students:", error);
  }
}

// Create table row from student data
function createTableRow(student) {
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td>${student.name}</td>
    <td>${student.age}</td>
    <td>${student.class}</td>
    <td>${student.group}</td>
    <td>${student.city}</td>
    <td>
      <button class="deleteBtn" data-id="${student._id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
          <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
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

        // Remove from allTableRows array
        const index = allTableRows.indexOf(newRow);
        if (index > -1) {
          allTableRows.splice(index, 1);
        }

        // Show "No data found" if table is empty
        if (allTableRows.length === 0) {
          showNoDataMessage();
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to delete student");
      }
    }
  });

  return newRow;
}

// Add submit event listener to the form
studentForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  // Get values from form inputs
  const studentData = {
    name: document.getElementById("name").value,
    age: document.getElementById("age").value,
    class: document.getElementById("class").value,
    group: document.getElementById("group").value,
    city: document.getElementById("city").value,
  };

  try {
    // Save to database
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

    // Remove "No data found" message if it exists
    const noDataRow = tableBody.querySelector(".no-data");
    if (noDataRow) {
      noDataRow.remove();
    }

    // Add new row to table
    const newRow = createTableRow(savedStudent);
    tableBody.insertBefore(newRow, tableBody.firstChild);
    allTableRows.unshift(newRow);

    // Reset the form
    studentForm.reset();
  } catch (error) {
    console.error("Error saving student:", error);
    alert("Failed to save student data");
  }
});

// Search functionality (unchanged)
searchInput.addEventListener("input", function (e) {
  const searchTerm = e.target.value.toLowerCase();

  if (searchTerm === "") {
    allTableRows.forEach((row) => (row.style.display = ""));
    if (allTableRows.length === 0) {
      showNoDataMessage();
    }
    return;
  }

  let hasVisibleRows = false;

  allTableRows.forEach((row) => {
    const name = row.cells[0].textContent.toLowerCase();
    if (name.includes(searchTerm)) {
      row.style.display = "";
      hasVisibleRows = true;
    } else {
      row.style.display = "none";
    }
  });

  if (!hasVisibleRows) {
    showNoDataMessage();
  } else {
    const noDataRow = tableBody.querySelector(".no-data");
    if (noDataRow) {
      noDataRow.remove();
    }
  }
});

function showNoDataMessage() {
  const existingNoData = tableBody.querySelector(".no-data");
  if (existingNoData) {
    existingNoData.remove();
  }

  const noDataRow = document.createElement("tr");
  noDataRow.className = "no-data";
  noDataRow.innerHTML = "<td colspan='5'>No data found!</td>";
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
      const newRow = createTableRow(student);
      tableBody.insertBefore(newRow, tableBody.firstChild);
      allTableRows.unshift(newRow);
    });

    // Reset file input
    fileUpload.value = "";

    alert("File uploaded successfully!");
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to upload file");
  }
});
