const http = require('http');
const cors = require("cors");
const express = require("express");
const app = express();
app.use(cors());

const initRoutes = require("./src/routes");

app.use(express.urlencoded({ extended: true }));
initRoutes(app);

const port = process.env.PORT || 2000;
// app.listen(port, () => {
//     console.log(`Running at localhost:${port}`);
// });

// const App = require('./App');

const server = http.createServer(app);

server.listen(port, () => {
    console.log("Server started at http://localhost:" + port);
});