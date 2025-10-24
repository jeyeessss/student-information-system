// script.js - SIMS frontend

const API_BASE = 'http://localhost:3000/students';

// Elements
const form = document.getElementById('studentForm');
const clearBtn = document.getElementById('clearBtn');
const studentsTbody = document.getElementById('studentsTbody');
const searchInput = document.getElementById('searchInput');
const filterMale = document.getElementById('filterMale');
const filterFemale = document.getElementById('filterFemale');
const showAllBtn = document.getElementById('showAll');

// Helper: fetch all students
async function fetchStudents() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

// Render list in table
function renderStudents(students) {
  studentsTbody.innerHTML = '';
  if (!students || students.length === 0) return;
  students.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(String(s.studentId))}</td>
      <td>${escapeHtml(s.fullName)}</td>
      <td>${escapeHtml(s.gender)}</td>
      <td>${escapeHtml(s.gmail)}</td>
      <td>${escapeHtml(s.program)}</td>
      <td>${escapeHtml(String(s.yearLevel))}</td>
      <td>${escapeHtml(s.university)}</td>
      <td>
        <button class="btn btn-sm btn-danger btn-delete" data-id="${escapeHtml(String(s.studentId))}">Delete</button>
      </td>
    `;
    studentsTbody.appendChild(tr);
  });
}

// Escape (simple) to avoid injection in table
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Initial load
async function loadAndRender() {
  try {
    const students = await fetchStudents();
    renderStudents(students);
  } catch (err) {
    console.error(err);
    alert('Network error: could not load students. Is the server running at http://localhost:3000 ?');
  }
}

// Form submit - add student
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    studentId: document.getElementById('studentId').value.trim(),
    fullName: document.getElementById('fullName').value.trim(),
    gender: document.getElementById('gender').value,
    gmail: document.getElementById('gmail').value.trim(),
    program: document.getElementById('program').value.trim(),
    yearLevel: document.getElementById('yearLevel').value.trim(),
    university: document.getElementById('university').value.trim()
  };

  // Basic validation
  if (!payload.studentId || !payload.fullName || !payload.gmail) {
    alert('Please complete Student ID, Full Name and Gmail.');
    return;
  }
  if (!/^[^@\s]+@gmail\.com$/i.test(payload.gmail)) {
    alert('Please enter a valid Gmail address (example@gmail.com).');
    return;
  }
  if (isNaN(Number(payload.yearLevel)) || Number(payload.yearLevel) <= 0) {
    alert('Year Level must be a positive number.');
    return;
  }

  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert('Error: ' + (err.error || 'Could not add student.'));
      return;
    }

    // success
    await loadAndRender();
    form.reset();
  } catch (err) {
    console.error(err);
    alert('Network error: could not add student.');
  }
});

// Clear button
clearBtn.addEventListener('click', (e) => {
  e.preventDefault();
  form.reset();
});

// Delete (event delegation)
studentsTbody.addEventListener('click', async (e) => {
  const btn = e.target.closest('.btn-delete');
  if (!btn) return;
  const id = btn.dataset.id;
  if (!confirm(`Delete student ${id}?`)) return;

  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert('Delete failed: ' + (err.error || 'Unknown error'));
      return;
    }
    await loadAndRender();
  } catch (err) {
    console.error(err);
    alert('Network error: could not delete student.');
  }
});

// Search/filter
searchInput.addEventListener('input', async () => {
  const q = searchInput.value.trim().toLowerCase();
  try {
    const students = await fetchStudents();
    const filtered = students.filter(s =>
      s.fullName.toLowerCase().includes(q) ||
      s.program.toLowerCase().includes(q) ||
      s.gender.toLowerCase().includes(q)
    );
    renderStudents(filtered);
  } catch (err) {
    console.error(err);
    alert('Network error: search failed.');
  }
});

filterMale.addEventListener('click', async () => {
  try {
    const students = await fetchStudents();
    renderStudents(students.filter(s => String(s.gender).toLowerCase() === 'male'));
  } catch {
    alert('Network error: could not filter.');
  }
});

filterFemale.addEventListener('click', async () => {
  try {
    const students = await fetchStudents();
    renderStudents(students.filter(s => String(s.gender).toLowerCase() === 'female'));
  } catch {
    alert('Network error: could not filter.');
  }
});

showAllBtn.addEventListener('click', loadAndRender);

// start
loadAndRender();
  