// Import necessary modules
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Create an Express app
const app = express();
const PORT = process.env.PORT || 3000;
const rootPath = path.join(__dirname, 'Develop');

// Middleware for parsing JSON and URL-encoded data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(rootPath, 'public')));

// Path to the db.json file
const dbPath = path.join(__dirname, 'Develop', 'db', 'db.json');

// Function to read notes from db.json file
const readNotes = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8'); // Read file synchronously
    return JSON.parse(data); // Parse JSON data
  } catch (error) {
    console.error('Error reading notes:', error);
    return []; // Return an empty array in case of error
  }
};

let notes = readNotes(); // Initialize 'notes' array by reading from db.json

// Route to serve the 'notes.html' file
app.get('/notes', (req, res) => {
  res.sendFile(path.join(rootPath, 'public', 'notes.html'));
});

// Route to serve the 'index.html' file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(rootPath, 'public', 'index.html'));
});

// Route to get all notes from 'db.json'
// Sample server-side code in app.js
app.get('/api/notes', (req, res) => {
  try {
    const notesData = readNotes(); // Fetch notes data using readNotes function
    console.log(notesData); // Log the data being sent to the console
    res.json(notesData); // Send 'notesData' as JSON response
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});


// Route to add a new note to 'db.json'
app.post('/api/notes', (req, res) => {
  const newNote = {
    id: uuidv4(), // Generate a unique ID for the new note
    title: req.body.title,
    text: req.body.text,
  };

  notes.push(newNote); // Add the new note to 'notes' array

  try {
    fs.writeFileSync(dbPath, JSON.stringify(notes, null, 2)); // Write 'notes' array to 'db.json'
    res.json(newNote); // Send the newly added note as JSON response
  } catch (error) {
    console.error('Error writing note to db:', error);
    res.status(500).json({ error: 'Failed to save note' }); // Send error response if writing fails
  }
});

// Route to delete a note from 'db.json' by ID
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  notes = notes.filter((note) => note.id !== noteId); // Filter out the note with matching ID

  try {
    fs.writeFileSync(dbPath, JSON.stringify(notes, null, 2)); // Write updated 'notes' array to 'db.json'
    res.json({ message: 'Note deleted' }); // Send success message as JSON response
  } catch (error) {
    console.error('Error deleting note from db:', error);
    res.status(500).json({ error: 'Failed to delete note' }); // Send error response if deletion fails
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
