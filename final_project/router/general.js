const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    try {
        // Replace the URL with the actual endpoint where the book data is stored
        const response = await axios.get('https://api-endpoint.com/books');
        books = response.data;  // Assuming the response contains the books data
    
        // Send the book list in JSON format with indentation
        res.send(JSON.stringify(books, null, 4));
      } catch (error) {
        // Handle error if the API request fails
        res.status(500).send("Error retrieving books data.");
      }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;

    // Create a new Promise to simulate an asynchronous operation
    new Promise((resolve, reject) => {
        // Filter books based on the author's name (simulating async operation)
        const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());

        // If books found by the author, resolve the promise, else reject
        if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
        } else {
            reject("No books found by this author.");
        }
    })
    .then((booksByAuthor) => {
        // If books were found, send them as the response
        res.send(JSON.stringify(booksByAuthor, null, 4));
    })
    .catch((error) => {
        // If no books were found, send a 404 response
        res.status(404).send(error);
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;

    // Create a new Promise to simulate asynchronous operation
    new Promise((resolve, reject) => {
        // Filter books based on the title (this part simulates the async behavior)
        let booksByTitle = Object.entries(books)
            .filter(([id, book]) => book.title.toLowerCase() === title.toLowerCase())
            .map(([id, book]) => ({ id, ...book }));

        // If books are found by the title, resolve the promise
        if (booksByTitle.length > 0) {
            resolve(booksByTitle);
        } else {
            // If no books are found, reject the promise with a message
            reject('No books found with this title.');
        }
    })
    .then((booksByTitle) => {
        // Send the filtered books in response
        res.send({ "booksByTitle": booksByTitle });
    })
    .catch((error) => {
        // Handle error if no books are found
        res.status(404).send({ "error": error });
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

module.exports.general = public_users;
