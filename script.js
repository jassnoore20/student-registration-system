// StudentHub: a small student record manager using browser Local Storage.

const STORAGE_KEY = "studentHubRecords";
let students = loadStudents();
let editingId = null;

const studentForm = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable");
const searchInput = document.getElementById("searchInput");
const formMessage = document.getElementById("formMessage");

function loadStudents() {
  // Read saved records. If there are none, start with an empty list.
  const savedRecords = localStorage.getItem(STORAGE_KEY);
  return savedRecords ? JSON.parse(savedRecords) : [];
}

function saveStudents() {
  // Convert the student array into text and save it in this browser.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function renderStudents(searchTerm = "") {
  const term = searchTerm.toLowerCase().trim();
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(term) ||
    student.email.toLowerCase().includes(term) ||
    student.course.toLowerCase().includes(term)
  );

  document.getElementById("totalStudents").textContent = students.length;
  document.getElementById("totalCourses").textContent =
    new Set(students.map(student => student.course)).size;
  document.getElementById("recordCount").textContent =
    `${filteredStudents.length} ${filteredStudents.length === 1 ? "record" : "records"}`;

  if (filteredStudents.length === 0) {
    studentTable.innerHTML = `<tr><td colspan="4" class="empty-state">${
      students.length === 0 ? "No students yet. Add your first record." : "No matching students found."
    }</td></tr>`;
    return;
  }

  studentTable.innerHTML = filteredStudents.map(student => `
    <tr>
      <td>
        <div class="student-name">${escapeHTML(student.name)}</div>
        <div class="student-email">${escapeHTML(student.email)}</div>
      </td>
      <td>${student.age}</td>
      <td><span class="course-pill">${escapeHTML(student.course)}</span></td>
      <td>
        <button class="action-btn edit-btn" data-action="edit" data-id="${student.id}">Edit</button>
        <button class="action-btn delete-btn" data-action="delete" data-id="${student.id}">Delete</button>
      </td>
    </tr>
  `).join("");
}

// Escape user-entered text before placing it into the page.
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

studentForm.addEventListener("submit", event => {
  event.preventDefault();

  const student = {
    id: editingId || (window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    age: Number(document.getElementById("age").value),
    course: document.getElementById("course").value
  };

  if (!student.name || !student.email || !student.course || student.age < 16 || student.age > 100) {
    formMessage.textContent = "Please enter valid details in every field.";
    return;
  }

  const emailAlreadyUsed = students.some(existing =>
    existing.email.toLowerCase() === student.email.toLowerCase() && existing.id !== editingId
  );
  if (emailAlreadyUsed) {
    formMessage.textContent = "A student with this email already exists.";
    return;
  }

  if (editingId) {
    students = students.map(existing => existing.id === editingId ? student : existing);
    formMessage.textContent = "Student record updated successfully.";
  } else {
    students.push(student);
    formMessage.textContent = "Student added successfully.";
  }

  saveStudents();
  renderStudents(searchInput.value);
  resetForm();
});

studentTable.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const student = students.find(item => item.id === button.dataset.id);
  if (!student) return;

  if (button.dataset.action === "edit") {
    editingId = student.id;
    document.getElementById("name").value = student.name;
    document.getElementById("email").value = student.email;
    document.getElementById("age").value = student.age;
    document.getElementById("course").value = student.course;
    document.getElementById("formTitle").textContent = "Edit student";
    document.getElementById("submitBtn").innerHTML = 'Save changes <span>→</span>';
    document.getElementById("cancelEdit").classList.remove("hidden");
    formMessage.textContent = "Update the details and save your changes.";
    document.getElementById("name").focus();
  }

  if (button.dataset.action === "delete") {
    if (confirm(`Delete the record for ${student.name}?`)) {
      students = students.filter(item => item.id !== student.id);
      saveStudents();
      renderStudents(searchInput.value);
      if (editingId === student.id) resetForm();
    }
  }
});

function resetForm() {
  studentForm.reset();
  editingId = null;
  document.getElementById("formTitle").textContent = "Add a student";
  document.getElementById("submitBtn").innerHTML = 'Add student <span>→</span>';
  document.getElementById("cancelEdit").classList.add("hidden");
}

document.getElementById("cancelEdit").addEventListener("click", () => {
  resetForm();
  formMessage.textContent = "";
});

searchInput.addEventListener("input", () => renderStudents(searchInput.value));

renderStudents();
