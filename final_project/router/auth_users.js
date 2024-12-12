const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
// Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
// Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }

}

//only registered users can login
regd_users.post("/login", (req,res) => {
   const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;  // Get the ISBN from the URL parameter
    const review = req.query.review;  // Get the review from the query parameter
    const username = req.session.authorization?.username;  // Get the username from session

    // Find the book based on the ISBN
    let book = books[isbn];  

    if (book) {  // Check if the book exists
        if (review) {
            // Update the reviews object for the book
            book.reviews[username] = review;

            return res.status(200).send(`The review for ISBN ${isbn} was updated.`);
        } else {
            return res.status(400).send("Review is required.");
        }
    } else {
        return res.status(404).send("Book not found!");
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;  // Get the ISBN from the URL parameter
    const username = req.session.authorization?.username;  // Get the username from session
    
    // Check if book exists
    let book = books[isbn];

    if (book && username) {  // Ensure the book and user exist
        // Check if the review exists for the current user
        if (book.reviews[username]) {
            // Delete the review for the user
            delete book.reviews[username];
            res.send(`Review for the book with ISBN ${isbn} posted by ${username} deleted.`);
        } else {
            res.status(404).send(`Review for ISBN ${isbn} not found for user ${username}.`);
        }
    } else {
        res.status(404).send("Book not found or user not authenticated.");
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
