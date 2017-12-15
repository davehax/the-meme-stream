const fs = require("fs");
const fetch = require("node-fetch");
const path = require("path");
const express = require("express");
const router = express.Router();

const apiBase = "https://api.twitter.com/1.1";
const clientId = "Zn7r95xXRB0YhvouOkA3e8Kf8";

// GET TOKEN
router.get("/token", (req, response) => {
    // have we got a cached access_token ?
    ///TODO: Check for cached access_token here

    // get twitter client secret from environment or git ignored file (manually created)
    let secret = process.env.TWITTERSECRET;
    
    // This if branch will only be triggered in development
    if (typeof(secret) === "undefined") {
        secret = fs.readFileSync(path.resolve(__dirname, "../secret/twitter.txt"), "ASCII");
    }

    // node-fetch package provides client Fetch API on the server!
    // Make a call to the Reddit API auth endpoint
    let basicAuth = Buffer.from(`${clientId}:${secret}`).toString('base64');
    
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

// PROXY GET REQUEST
router.get("/proxy", (req, response) => {
    let url = req.query.url;
    let bearerToken = req.query.token;
    let method = req.query.method || "GET";

    // Fetch data from the Twitter API
    let apiRequest = fetch(`${apiBase}${url}`, {
        method: method,
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${bearerToken}`,
            "User-Agent": "The Meme Stream v0.1"
        }
    });

    apiRequest
        .then((res) => {
            if (res.ok) {
                return res.json()
            }
            else {
                console.log(res);
                // It's probably the request URL or Token. Send a 500 error message + the response.
                response.status(500).send(res);
            }
        })
        .then((res) => {
            response.status(200).send(res);
        })
        .catch((error) => {
            reponse.status(500).send(error);
        })
})

// export our routes!
module.exports = router;