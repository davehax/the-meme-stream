// Define our requires
const express = require("express");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

// Express app
const app = express();
// What port to listen on?
const PORT = process.env.PORT || 5000;

// Add endpoint for automatically refreshing auth tokens
app.route("/token/reddit").get((req, response) => {
    // first, enable CORS for development
    response.header("Access-Control-Allow-Origin", "http://localhost:3000");

    // get reddit client secret from environment or git ignored file (manually created)
    let secret = process.env.REDDITSECRET;

    // This if branch will only be triggered in development
    if (typeof(secret) === "undefined") {
        secret = fs.readFileSync(path.resolve(__dirname, "secret/reddit.txt"), "ASCII");
    }

    // node-fetch package provides client Fetch API on the server!
    // Make a call to the Reddit API auth endpoint
    let basicAuth = Buffer.from(`CkkaI8V5RMB09Q:${secret}`).toString('base64');

    fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${basicAuth}`
        },
        body: "grant_type=client_credentials&duration=permanent"
    })
        .then((res) => res.json())
        .then((res) => {
            response.status(200).send(res);
        })
        .catch((error) => {
            response.status(500).send(error);
        })
});

app.route("/token/twitter").get((req, response) => {
    // first, enable CORS for development
    response.header("Access-Control-Allow-Origin", "http://localhost:3000");

    // have we got a cached access_token ?
    ///TODO: Check for cached access_token here

    // get twitter client secret from environment or git ignored file (manually created)
    let secret = process.env.TWITTERSECRET;
    
    // This if branch will only be triggered in development
    if (typeof(secret) === "undefined") {
        secret = fs.readFileSync(path.resolve(__dirname, "secret/twitter.txt"), "ASCII");
    }

    // node-fetch package provides client Fetch API on the server!
    // Make a call to the Reddit API auth endpoint
    let basicAuth = Buffer.from(`Zn7r95xXRB0YhvouOkA3e8Kf8:${secret}`).toString('base64');
    
    fetch("https://api.twitter.com/oauth2/token", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${basicAuth}`
        },
        body: "grant_type=client_credentials"
    })
        .then((res) => res.json())
        .then((res) => {
            response.status(200).send(res);
        })
        .catch((error) => {
            response.status(500).send(error);
        })
})

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