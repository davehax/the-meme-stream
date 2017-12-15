const fs = require("fs");
const fetch = require("node-fetch");
const path = require("path");
const express = require("express");
const router = express.Router();
const clientId = "CkkaI8V5RMB09Q";

// Add endpoint for automatically refreshing auth tokens
router.get("/token", (req, response) => {
    // get reddit client secret from environment or git ignored file (manually created)
    let secret = process.env.REDDITSECRET;

    // This if branch will only be triggered in development
    if (typeof(secret) === "undefined") {
        secret = fs.readFileSync(path.resolve(__dirname, "../secret/reddit.txt"), "ASCII");
    }

    // node-fetch package provides client Fetch API on the server!
    // Make a call to the Reddit API auth endpoint
    let basicAuth = Buffer.from(`${clientId}:${secret}`).toString('base64');

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

module.exports = router;