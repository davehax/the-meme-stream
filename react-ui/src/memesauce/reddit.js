import RemoteDataPager, { DataPager } from './datapager.js';

const development = false;
let accessToken = "";
let expireTime = "";

const getRequestHeaders = () => {
    return {
        "Accept": "application/json",
        "Authorization": `Bearer: ${accessToken}`,
        "User-Agent": "web:the-meme-stream:v0.1 (by /u/sxyfrg)"
    }
}

const refreshAccessToken = () => {
    let refreshTokenUrl = "/token/reddit";
    if (development) { refreshTokenUrl = `http://localhost:5000${refreshTokenUrl}`; }

    return new Promise((resolve, reject) => {
        fetch(refreshTokenUrl, {
            headers: {
                "Accept": "application/json"
            }
        })
            .then((res) => res.json())
            .then((res) => {
                accessToken = res.access_token;
                resolve();
            })
            .catch((error) => {
                reject(error);
            })
    });
}

// SAUCY! RedditSauce!
class RedditSauce {
    constructor(subreddit, sort) {
        this.remotePager = new RemoteDataPager(this.urlGenerator.bind(this), getRequestHeaders());
        this.dataPager = new DataPager(this.remotePager, 3, this.dataParser.bind(this));

        this.subreddit = subreddit;
        this.sort = sort;
        this.nextPageToken = "";
    }

    // Call this method first! An access token must be retrieved from the server first before use.
    initialise() {
        // If accessToken is already set, resolve
        if (accessToken !== "") {
            return Promise.resolve();
        }
        // Otherwise get an access token before resolving
        else {
            return new Promise((resolve, reject) => {
                refreshAccessToken()
                    .then(() => { resolve() })
                    .catch((error) => { reject(error) });
            })
        }
    }

    // Generate the url to get JSON data from
    urlGenerator(page) {
        // generate url
        let url = `https://oauth.reddit.com/r/${this.subreddit}/${this.sort}.json`;
        if (this.nextPageToken !== "") {
            url += `&after=${this.nextPageToken}`;
        }
        return url;
    }

    // Get the next batch of MEMES... well, data. Depending on how you're using this!
    getNext() {
        return this.dataPager.getNext();
    }

    // Parse JSON data to:
    // - extract next page link
    // - stamp data with __type property
    dataParser(data) {
        // extract next page link
        this.nextPageToken = data.data.after;

        // extract relevant items - reddit returns up to 25 by default
        let parsedData = data.data.children.filter((item) => {
            return !item.data.stickied && !item.data.is_self && item.data.post_hint === "image";
        });

        parsedData = parsedData.map((item) => { return item.data });

        parsedData.forEach((item) => { 
            // stamp item with __type = "reddit"
            item.__type = "reddit";
            
            // fix all image urls >_>
            for (let i = 0; i < item.preview.images.length; i++) {
                for (let j = 0; j < item.preview.images[i].resolutions.length; j++) {
                    item.preview.images[i].resolutions[j].url = item.preview.images[i].resolutions[j].url.replace(/&amp;/gi, "&");
                }
            }
        })
            
        return parsedData;
    }
}


// return fetch("https://oauth.reddit.com/r/dankmemes/hot.json", {
//     headers: {
//         "Accept": "application/json",
//         "Authorization": `Bearer: ${res.access_token}`,
//         "User-Agent": "web:the-meme-stream:v0.1 (by /u/sxyfrg)"
//     }
// })

if (accessToken === "") {
    refreshAccessToken();
}

export default RedditSauce;