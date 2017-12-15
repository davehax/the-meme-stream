// Define our requires
const express = require("express");
const path = require("path");

// Express app
const app = express();
// What port to listen on?
const PORT = process.env.PORT || 5000;

// Middleware to enable CORS from localhost:3000
app.use(function (req, response, next) {
    response.header("Access-Control-Allow-Origin", "http://localhost:3000");
    next();
});

app.use("/reddit", require('./routes/reddit'));
app.use("/twitter", require('./routes/twitter'));

// Priority - serve static files from our build folder
app.use(express.static(path.resolve(__dirname, "../react-ui/build")));

// Enable Single Page Application routing by resolving to the react app for all other requests
app.use("*", (req, response) => {
    response.sendFile(path.resolve(__dirname, "../react-ui/build", "index.html"));
});

// Finally, "listen" on PORT
app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});