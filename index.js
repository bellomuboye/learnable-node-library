/**
 * Entry file to out application
 */
const port = process.env.PORT || 8080;
const http = require('http');
const url = require('url');
const { StringDecoder } = require('string_decoder');
const routeHandler = require('./lib/routehandler');

const helper = require('./lib/helper')
const fileUtil = require('./lib/fileUtil')

const createAdminToken = () => {
    let adminToken = helper.generateRandomString(30)
    let data = {
        "adminToken": adminToken
    }
    fileUtil.create('admin', "index", data, (err) => {
            if (!err) {
                console.log("Admin Token is " + adminToken);
            } else if (err = "could not create new file, it may already exists") {
                fileUtil.read('admin', "index", (err, data) => {
                    console.log("Admin Token is " + data.adminToken)
                })
            }
        });
}
const httpServer = http.createServer((req, res) => {
    //parse the incoming url
    const parsedurl = url.parse(req.url, true);
    //get the path name
    const pathname = parsedurl.pathname;
    const trimedPath = pathname.replace(/^\/+|\/+$/g, "");
    //get the Http Method
    const method = req.method.toLowerCase();
    //get the query string
    const queryStringObj = parsedurl.query;
    //get the request headers
    const headers = req.headers;

    const decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

       const parsedPayload = buffer.length ? JSON.parse(buffer) : {};
        const data = {
            trimedPath: trimedPath,
            query: queryStringObj,
            method: method,
            headers: headers,
            payload: parsedPayload
        };

        //use the route handler module to handle the requests
        routeHandler(data, (statusCode, result) => {
            statusCode = typeof statusCode === 'number' ? statusCode : 200;
            result = typeof res === 'object' ? result : {};
            const responseObj = JSON.stringify(result);

            res.setHeader('Content-type', "application/json");
            res.writeHead(statusCode);
            res.write(responseObj);
            res.end();
            // console.log(`the url visited was: ${trimedPath}, and the method is ${method}`);
        });
    });
});

//start listening on port 8080
httpServer.listen(port, () => {
    console.log(`server is listening at port ${port}`);
    createAdminToken()
});
