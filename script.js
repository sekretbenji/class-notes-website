/*
 * Class Notes Platform
 *
 * This script implements the basic client-side logic for a simple class
 * knowledge platform. Each student can sign up, log in, create personal
 * notes, and choose whether to keep them private or publish them to the
 * class library. All data is stored in localStorage for the sake of
 * demonstration—there is no backend in this version. This makes it easy to
 * test locally by opening index.html in a browser without any server.
 */

// Utility: generate a simple unique ID using current timestamp and a random
// number. This is sufficient for demo purposes but should be replaced by a
// proper ID generator in a real backend.
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// DOM element references
const authSection = document.getElementById('auth-section');
const authTitle = document.getElementById('auth-title');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const toggleAuth = document.getElementById('toggleAuth');

const navLinksWrapper = document.getElementById('nav-links');
const navLinks = document.querySelectorAll('.nav-link');
const logoutBtn = document.getElementById('logoutBtn');

const dashboardSection = document.getElementById('dashboard');
const notesSection = document.getElementById('my-notes');
const librarySection = document.getElementById('library');
const profileSection = document.getElementById('profile');
const noteEditorSection = document.getElementById('note-editor');

const userNameSpan = document.getElementById('userName');
const notesCountSpan = document.getElementById('notesCount');
const publishedCountSpan = document.getElementById('publishedCount');
const notesList = document.getElementById('notesList');

const newNoteBtn = document.getElementById('newNoteBtn');
const noteForm = document.getElementById('noteForm');
const editorTitle = document.getElementById('editorTitle');
const noteTitleInput = document.getElementById('noteTitle');
const noteSubjectInput = document.getElementById('noteSubject');
const noteTopicInput = document.getElementById('noteTopic');
const noteContentInput = document.getElementById('noteContent');
const noteVisibilitySelect = document.getElementById('noteVisibility');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');

const searchInput = document.getElementById('searchInput');
const libraryList = document.getElementById('libraryList');

const profileNameSpan = document.getElementById('profileName');
const profileEmailSpan = document.getElementById('profileEmail');

// Application state
let users = [];
let currentUserId = null;
let editingNoteId = null;

// Load users and current user ID from localStorage
function loadData() {
  try {
    const storedUsers = localStorage.getItem('users');
    users = storedUsers ? JSON.parse(storedUsers) : [];
  } catch (err) {
    console.error('Failed to parse users from localStorage', err);
    users = [];
  }
  currentUserId = localStorage.getItem('currentUserId');
}

// Persist users to localStorage
function saveData() {
  localStorage.setItem('users', JSON.stringify(users));
}

// Retrieve the currently logged in user object
function getCurrentUser() {
  return users.find((u) => u.id === currentUserId) || null;
}

// Display the authentication section and hide the rest
function showAuthSection() {
  authSection.classList.remove('hidden');
  navLinksWrapper.classList.add('hidden');
  dashboardSection.classList.add('hidden');
  notesSection.classList.add('hidden');
  librarySection.classList.add('hidden');
  profileSection.classList.add('hidden');
  noteEditorSection.classList.add('hidden');
}

// Display the app (dashboard) once a user is logged in
function showApp() {
  const user = getCurrentUser();
  if (!user) {
    showAuthSection();
    return;
  }
  authSection.classList.add('hidden');
  navLinksWrapper.classList.remove('hidden');
  updateDashboard();
  showSection('dashboard');
}

// Show a specific section by ID; hide others
function showSection(id) {
  // Hide all primary sections
  dashboardSection.classList.add('hidden');
  notesSection.classList.add('hidden');
  librarySection.classList.add('hidden');
  profileSection.classList.add('hidden');
  noteEditorSection.classList.add('hidden');
  // Remove highlight from nav buttons
  navLinks.forEach((btn) => btn.classList.remove('underline'));
  // Show selected section
  switch (id) {
    case 'dashboard':
      dashboardSection.classList.remove('hidden');
      updateDashboard();
      highlightNav('dashboard');
      break;
    case 'my-notes':
      notesSection.classList.remove('hidden');
      renderMyNotes();
      highlightNav('my-notes');
      break;
    case 'library':
      librarySection.classList.remove('hidden');
      renderLibrary();
      highlightNav('library');
      break;
    case 'profile':
      profileSection.classList.remove('hidden');
      renderProfile();
      highlightNav('profile');
      break;
    default:
      dashboardSection.classList.remove('hidden');
      highlightNav('dashboard');
      break;
  }
}

// Highlight active navigation link
function highlightNav(targetId) {
  navLinks.forEach((btn) => {
    if (btn.getAttribute('data-target') === targetId) {
      btn.classList.add('underline');
    }
  });
}

// Update the dashboard with counts and username
function updateDashboard() {
  const user = getCurrentUser();
  if (!user) return;
  userNameSpan.textContent = user.name;
  const totalNotes = user.notes ? user.notes.length : 0;
  const publishedNotes = user.notes
    ? user.notes.filter((n) => n.visibility === 'published').length
    : 0;
  notesCountSpan.textContent = totalNotes;
  publishedCountSpan.textContent = publishedNotes;
}

// Render the logged in user's notes
function renderMyNotes() {
  const user = getCurrentUser();
  if (!user) return;
  // Clear current list
  notesList.innerHTML = '';
  if (!user.notes || user.notes.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.textContent = 'You have no notes yet.';
    emptyMsg.classList.add('text-gray-600');
    notesList.appendChild(emptyMsg);
    return;
  }
  // Render each note card
  user.notes.forEach((note) => {
    const card = document.createElement('div');
    card.className = 'bg-white p-4 rounded shadow';
    // Title and subject
    const title = document.createElement('h3');
    title.className = 'font-semibold text-lg';
    title.textContent = note.title;
    const subject = document.createElement('p');
    subject.className = 'text-sm text-gray-600';
    subject.textContent = `Subject: ${note.subject}`;
    const topic = document.createElement('p');
    topic.className = 'text-sm text-gray-600';
    topic.textContent = note.topic ? `Topic: ${note.topic}` : '';
    const content = document.createElement('p');
    content.className = 'mt-2 whitespace-pre-wrap';
    content.textContent = note.content;
    const status = document.createElement('p');
    status.className = 'text-sm mt-2';
    status.innerHTML = `<strong>Status:</strong> ${
      note.visibility === 'published' ? 'Published' : 'Private'
    }`;
    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'mt-3 flex flex-wrap gap-2';
    const editBtn = document.createElement('button');
    editBtn.className =
      'bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => openNoteEditor(note.id));
    const deleteBtn = document.createElement('button');
    deleteBtn.className =
      'bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteNote(note.id));
    const toggleBtn = document.createElement('button');
    toggleBtn.className =
      'bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm';
    toggleBtn.textContent =
      note.visibility === 'published' ? 'Make Private' : 'Publish';
    toggleBtn.addEventListener('click', () => toggleVisibility(note.id));
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    actions.appendChild(toggleBtn);
    // Append all to card
    card.appendChild(title);
    card.appendChild(subject);
    if (note.topic) card.appendChild(topic);
    card.appendChild(content);
    card.appendChild(status);
    card.appendChild(actions);
    notesList.appendChild(card);
  });
}

// Render the class library (published notes from all users)
function renderLibrary() {
  // Build a list of all published notes across users
  let allPublished = [];
  users.forEach((user) => {
    if (user.notes) {
      const published = user.notes.filter((n) => n.visibility === 'published');
      published.forEach((note) => {
        allPublished.push({
          ...note,
          author: user.name,
        });
      });
    }
  });
  // Filter based on search query
  const query = searchInput.value.toLowerCase().trim();
  if (query) {
    allPublished = allPublished.filter((note) => {
      return (
        note.title.toLowerCase().includes(query) ||
        note.subject.toLowerCase().includes(query) ||
        (note.topic && note.topic.toLowerCase().includes(query)) ||
        note.author.toLowerCase().includes(query)
      );
    });
  }
  // Clear the list
  libraryList.innerHTML = '';
  if (allPublished.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.textContent =
      query !== ''
        ? 'No notes match your search.'
        : 'No published notes yet.';
    emptyMsg.classList.add('text-gray-600');
    libraryList.appendChild(emptyMsg);
    return;
  }
  // Render each note in the library
  allPublished.forEach((note) => {
    const card = document.createElement('div');
    card.className = 'bg-white p-4 rounded shadow';
    const title = document.createElement('h3');
    title.className = 'font-semibold text-lg';
    title.textContent = note.title;
    const author = document.createElement('p');
    author.className = 'text-sm text-gray-600';
    author.textContent = `Author: ${note.author}`;
    const subject = document.createElement('p');
    subject.className = 'text-sm text-gray-600';
    subject.textContent = `Subject: ${note.subject}`;
    const topic = document.createElement('p');
    topic.className = 'text-sm text-gray-600';
    topic.textContent = note.topic ? `Topic: ${note.topic}` : '';
    const content = document.createElement('p');
    content.className = 'mt-2 whitespace-pre-wrap';
    content.textContent = note.content;
    card.appendChild(title);
    card.appendChild(author);
    card.appendChild(subject);
    if (note.topic) card.appendChild(topic);
    card.appendChild(content);
    libraryList.appendChild(card);
  });
}

// Render the profile page
function renderProfile() {
  const user = getCurrentUser();
  if (!user) return;
  profileNameSpan.textContent = user.name;
  profileEmailSpan.textContent = user.email;
}

// Open the note editor for a new note or editing an existing one
function openNoteEditor(noteId = null) {
  const user = getCurrentUser();
  if (!user) return;
  editingNoteId = noteId;
  // If editing existing note, populate fields
  let noteData = {
    title: '',
    subject: '',
    topic: '',
    content: '',
    visibility: 'private',
  };
  if (noteId) {
    const existingNote = user.notes.find((n) => n.id === noteId);
    if (existingNote) {
      noteData = { ...existingNote };
      editorTitle.textContent = 'Edit Note';
    }
  } else {
    editorTitle.textContent = 'Create Note';
  }
  // Set form fields
  noteTitleInput.value = noteData.title;
  noteSubjectInput.value = noteData.subject;
  noteTopicInput.value = noteData.topic || '';
  noteContentInput.value = noteData.content;
  noteVisibilitySelect.value = noteData.visibility;
  // Show editor and hide other sections
  noteEditorSection.classList.remove('hidden');
  notesSection.classList.add('hidden');
  dashboardSection.classList.add('hidden');
  librarySection.classList.add('hidden');
  profileSection.classList.add('hidden');
  // Remove nav highlight for others
  navLinks.forEach((btn) => btn.classList.remove('underline'));
}

// Save note (create or update)
function saveNote(event) {
  event.preventDefault();
  const user = getCurrentUser();
  if (!user) return;
  // Validate fields
  const title = noteTitleInput.value.trim();
  const subject = noteSubjectInput.value.trim();
  const topic = noteTopicInput.value.trim();
  const content = noteContentInput.value.trim();
  const visibility = noteVisibilitySelect.value;
  if (!title || !subject || !content) {
    alert('Please fill in all required fields (title, subject, content).');
    return;
  }
  // Create or update note
  if (!user.notes) user.notes = [];
  if (editingNoteId) {
    // Update existing note
    const noteIndex = user.notes.findIndex((n) => n.id === editingNoteId);
    if (noteIndex !== -1) {
      user.notes[noteIndex] = {
        ...user.notes[noteIndex],
        title,
        subject,
        topic,
        content,
        visibility,
      };
    }
  } else {
    // Create new note
    const newNote = {
      id: generateId(),
      title,
      subject,
      topic,
      content,
      visibility,
      createdAt: Date.now(),
    };
    user.notes.push(newNote);
  }
  // Persist changes
  saveData();
  // Reset editing state
  editingNoteId = null;
  // Hide editor and go back to My Notes
  noteEditorSection.classList.add('hidden');
  notesSection.classList.remove('hidden');
  renderMyNotes();
  updateDashboard();
}

// Delete a note by ID (with confirmation)
function deleteNote(noteId) {
  const user = getCurrentUser();
  if (!user) return;
  if (!confirm('Are you sure you want to delete this note?')) return;
  user.notes = user.notes.filter((n) => n.id !== noteId);
  saveData();
  renderMyNotes();
  updateDashboard();
}

// Toggle note visibility between private and published
function toggleVisibility(noteId) {
  const user = getCurrentUser();
  if (!user) return;
  const note = user.notes.find((n) => n.id === noteId);
  if (!note) return;
  note.visibility = note.visibility === 'published' ? 'private' : 'published';
  saveData();
  renderMyNotes();
  updateDashboard();
  // If in library view, refresh list to reflect change
  renderLibrary();
}

// Log out the current user
function logout() {
  localStorage.removeItem('currentUserId');
  currentUserId = null;
  showAuthSection();
}

// Setup event listeners
function setupEventListeners() {
  // Toggle between login and signup forms
  toggleAuth.addEventListener('click', () => {
    if (loginForm.classList.contains('hidden')) {
      // Show login, hide signup
      signupForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      authTitle.textContent = 'Login';
      toggleAuth.textContent = "Don't have an account? Sign up";
    } else {
      // Show signup, hide login
      loginForm.classList.add('hidden');
      signupForm.classList.remove('hidden');
      authTitle.textContent = 'Sign Up';
      toggleAuth.textContent = 'Already have an account? Login';
    }
  });
  // Handle login form submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const user = users.find(
      (u) => u.email.toLowerCase() === email && u.password === password
    );
    if (!user) {
      alert('Invalid email or password.');
      return;
    }
    currentUserId = user.id;
    localStorage.setItem('currentUserId', currentUserId);
    showApp();
  });
  // Handle signup form submission
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;
    if (!name || !email || !password) {
      alert('Please fill in all fields.');
      return;
    }
    const existing = users.find((u) => u.email.toLowerCase() === email);
    if (existing) {
      alert('An account with that email already exists.');
      return;
    }
    const newUser = {
      id: generateId(),
      name,
      email,
      password,
      notes: [],
    };
    users.push(newUser);
    saveData();
    currentUserId = newUser.id;
    localStorage.setItem('currentUserId', currentUserId);
    // Reset signup form
    signupForm.reset();
    showApp();
  });
  // Navigation link clicks
  navLinks.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      showSection(target);
    });
  });
  // Logout
  logoutBtn.addEventListener('click', () => {
    logout();
  });
  // New note button
  newNoteBtn.addEventListener('click', () => {
    openNoteEditor();
  });
  // Save note form
  noteForm.addEventListener('submit', saveNote);
  // Cancel note editing
  cancelNoteBtn.addEventListener('click', () => {
    editingNoteId = null;
    noteEditorSection.classList.add('hidden');
    notesSection.classList.remove('hidden');
    renderMyNotes();
  });
  // Search library
  searchInput.addEventListener('input', () => {
    renderLibrary();
  });
}

// Initialize application
function init() {
  loadData();
  setupEventListeners();
  if (currentUserId && getCurrentUser()) {
    showApp();
  } else {
    showAuthSection();
  }
}

// Run init on page load
document.addEventListener('DOMContentLoaded', init);
