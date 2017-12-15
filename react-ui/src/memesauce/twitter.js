import RemoteDataPager, { DataPager } from './datapager.js';
import { getJson } from "../Util.js";

const clientId = "Zn7r95xXRB0YhvouOkA3e8Kf8";
let accessToken = "";

const getRequestHeaders = () => {
    return {
        "Accept": "application/json",
        "Authorization": `Bearer: ${accessToken}`//,
        // "User-Agent": "web:the-meme-stream:v0.1 (by /u/sxyfrg)"
    }
}

const refreshAccessToken = () => {
    // We have to contact our server as the process involves Client ID and >> Client Secret <<
    // Which we can't just go around spilling anywhere!
    let refreshTokenUrl_production = "/token/twitter";
    let refreshTokenUrl_development = "http://localhost:5000/token/twitter";

    return new Promise((resolve, reject) => {
        // First we attempt to get the access token from the current server
        fetch(refreshTokenUrl_production, {
            headers: {
                "Accept": "application/json"
            }
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }
                else {
                    // Otherwise we will get the access token from the development server hosted locally
                    return getJson(refreshTokenUrl_development)
                }
            })
            .then((res) => {
                accessToken = res.access_token;
                resolve();
            })
            .catch((error) => reject(error));
    });
}

class TwitterSauce {
    constructor(searchQuery, count = 5) {
        this.remoteDataPager = new RemoteDataPager(this.urlGenerator.bind(this), getRequestHeaders());
        this.dataPager = new DataPager(this.remoteDataPager, count, this.dataParser.bind(this));

        this.nextResultsUrl = "";
        this.searchQuery = encodeURIComponent(searchQuery);
    }

    // Static initialise function
    static initialise() {
        if (accessToken !== "") { 
            return Promise.resolve(); 
        }
        else {
            return refreshAccessToken();
        }
    }

    // Generate the next URL to request data from
    urlGenerator(page) {
        let url = `https://api.twitter.com/1.1/search/tweets.json?q=${this.searchQuery}&lang=en`;

        if (this.nextResultsUrl !== "") {
            url = `https://api.twitter.com/1.1/search/tweets.json${this.nextResultsUrl}`;
        }

        return url;
    }

    getNext() {
        return this.dataPager.getNext();
    }

    // Parse the data received in the DataPager class
    dataParser(data) {
        this.nextResultsUrl = data.search_metadata.next_results;

        // Stamp the tweets with __type = "twitter"
        for (let i = 0; i < data.statuses.length; i++) {
            data.statuses[i].__type = "twitter";
        }

        return data.statuses;
    }
}

export default TwitterSauce;

