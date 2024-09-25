const http = require('http');

const port = process.env.PORT || 2000;

const App = require('./App');

const server = http.createServer(App);

server.listen(port, () => {
    console.log("Server started at http://localhost:" + port);
});