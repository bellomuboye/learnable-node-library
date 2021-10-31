const fileUtil = require('../fileUtil');
const helper = require('../helper');
const books = require('./books');

const users = {};
//Register a new user
users.registerUser = (data,callback) => {
	//validate that all required fields are filled out
    let name = typeof(data.payload.name) === 'string' && data.payload.name.trim().length > 0 ? data.payload.name : false;
    data.payload.books_borrowed = [];
    if (name) {
        const fileName = data.payload.library_id = helper.generateRandomString(30);
        fileUtil.create('users', fileName, data.payload, (err) => {
            if (!err) {
                callback(200, { message: "user was registered successfully", data: null });
            } else {
                callback(400, { message: "could not register this user" });
            }
        });
    }else {
        //Alert user to complete missing fields
        callback(400, { message: "Enter this user's name" });
    }
}
//read data for a single user:
users.getUser = (data,callback) => {
	if (data.query.library_id) {
        fileUtil.read('users', data.query.library_id, (err, data) => {
            if (!err && data) {
                callback(200, { message: 'user retrieved', data: data });
            } else {
                callback(404, { err: err, data: data, message: 'could not retrieve user' });
            }
        });
    } else {
        callback(404, { message: 'user not found', data: null });
    }
}

users.collectBookFromLibrary = (data,callback,book) => {
    let userLibraryId = data.headers.authorization.split(" ")[1]

    fileUtil.read('users', userLibraryId, (err, user) => {
        if (err) return callback(404, {err, message: "could not access user" });
        //Check if user already borrowed this book
        if (user.books_borrowed.includes(data.query.book_id)) 
            return callback(404, {message: 'This user already borrowed this book' });
        //add book id to user's list of borrowed books and update user file:
        user.books_borrowed.push(data.query.book_id);
        fileUtil.update('users', userLibraryId, user,  (err) => {
            if (err) return callback(404, {err, message: "could not update user with new book" });
            book.quantity--;
            books.updateLibrary(data,callback,book);
            return callback(404, {message: 'This user has successfully borrowed this book' });
        });
    });
}
users.giveBookToLibrary = (data,callback,book) => {
    let userLibraryId = data.headers.authorization.split(" ")[1]

    fileUtil.read('users', data.query.library_id, (err, user) => {
        if (err) return callback(404, {err, message: "could not access user" });
        //Check if user already borrowed this book
        if (!user.books_borrowed.includes(data.query.book_id)) 
            return callback(404, { message: "This user has not borrowed this book" });
        //remove book id from user's list of borrowed books and update user file:
        user.books_borrowed.splice(user.books_borrowed.indexOf(data.library_id),1);
        fileUtil.update('users', data.query.library_id,user,  (err) => {
            if (err) return callback(404, {err, message: "could not update user" });
            book.quantity++;
            books.updateLibrary(data,callback,book);
            return callback(404, {message: 'This user has successfully returned this book' });
        });
    });
}
users.requestBook = (data,callback) => {
    //validate that all required fields are filled out
    let library_id = data.headers.authorization.split(" ")[1];
    library_id = typeof(library_id) === 'string' && library_id.trim().length > 0 ? library_id : false;
    if(!library_id) return callback(400, { message: "Enter your library id and book id" });
    //Check if user is registered
    fileUtil.is_existing('users',library_id, (err) => {
        if (err) return callback(400, { message: "Invalid User" });
        //Initiate the process of collecting book: 
        books.lendBook(data,callback,users.collectBookFromLibrary);
    })
}

users.returnBook = (data,callback) => {
	//validate that all required fields are filled out
    let library_id = data.headers.authorization.split(" ")[1];;
    library_id = typeof(library_id) === 'string' && library_id.trim().length > 0 ? library_id : false;
    if(!library_id)	return callback(400, { message: "Enter your library id and book id" });
    //Check if user is registered
    fileUtil.is_existing('users',library_id, (err) => {
		if (err) return callback(400, { message: "Invalid User" });
		//Initiate the process of collecting book: 
    	books.retrieveBook(data,callback, users.giveBookToLibrary);
	})
    
}
module.exports = users;