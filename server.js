const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path'); // Import path module
const app = express();

app.use(bodyParser.json());
// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'checkers'
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Serve static files (HTML, CSS, etc.)
app.use(express.static(__dirname)); // Serve static files from the same directory as server.js

// Serve index.html on root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Use path.join to construct file path
});


app.post('/api/insertData', (req, res) => {
    const { name, age } = req.body;

    // Insert data into database
    const sql = 'INSERT INTO users (name, age) VALUES (?, ?)';
    connection.query(sql, [name, age], (err, result) => {
        if (err) {
            console.error('Error inserting data into database:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Send response back to client
        res.send('Data inserted successfully');
    });
});
///
// Function to store score in the database
app.post('/score', (req, res) => {
  const { winner } = req.body;

  let playerColumn = '';

  if (winner === 1) {
      playerColumn = 'player1_score';
  } else if (winner === 2) {
      playerColumn = 'player2_score';
  } else {
      res.status(400).json({ error: 'Invalid winner' });
      return;
  }

  const sql = `UPDATE scores SET ${playerColumn} = ${playerColumn} + 1`;

  connection.query(sql, (err, result) => {
      if (err) {
          console.error('Error updating score:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
      }
      console.log(`Score updated for player ${winner}`);
      res.status(200).json({ message: 'Score updated successfully' });
  });
});
app.post('/reset-scores', (req, res) => {
  // Perform the reset action in the database
  const query = 'UPDATE scores SET player1_score = 0, player2_score = 0';

  connection.query(query, (err, results) => {
      if (err) {
          console.error('Error resetting scores:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
      }

      // Send success response 
      res.json({ message: 'Scores reset successfully' });
  });
});

app.get('/scores', (req, res) => {
  // Query the database to get player1 and player2 scores
  const query = 'SELECT player1_score, player2_score FROM scores';

  connection.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching scores from database:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
      }

      // Extract player1 and player2 scores from the query results
      const player1Score = results[0].player1_score;
      const player2Score = results[0].player2_score;

      // Send the scores as JSON response
      res.json({ player1_score: player1Score, player2_score: player2Score });
  });
});


const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});