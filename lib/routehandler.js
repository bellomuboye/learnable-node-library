const books = require('./controllers/books');
const users = require('./controllers/users');

//Set up routes along with their handlers in the routes object
const routes = {
    "get" : {
        "book" : books.getBook,
        "user" : users.getUser,
    },
    "post" : {
        "book" : books.addNewBook,
        "user" : users.registerUser,
    },
    "put" : {
        "book" : books.updateBook,
        "user/borrow" : users.requestBook,
        "user/return" : users.returnBook,
    },
    "delete" : {
        "book" : books.removeBook
    }
};
let routeList = () => {
    let list = {};
    let methods = Object.keys(routes);
    methods.forEach(method=>list[method] = Object.keys(routes[method]));
    return list;
};
//Handle routing using the routes object:
let router = (data,callback) => {
    if(data.trimedPath === "") return callback(404,{ message: 'Welcome! Please use a valid route',routes:routeList()});
    if (!routes[data.method] ) return callback(404,{ message: 'This HTTP Method is not allowed!'});
    if (!routes[data.method][data.trimedPath]) return callback(404,{ message: 'Page not found!'});
    return routes[data.method][data.trimedPath](data,callback);
}

//Export the router or route handler below:
module.exports = router;