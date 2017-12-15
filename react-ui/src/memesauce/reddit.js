import RemoteDataPager, { DataPager } from './datapager.js';
import redditAccessTokenGenerator from './redditaccesstoken.js';

let accessToken = "";

const getRequestHeaders = () => {
    return {
        "Accept": "application/json",
        "Authorization": `Bearer: ${accessToken}`,
        "User-Agent": "web:the-meme-stream:v0.1 (by /u/sxyfrg)"
    }
}

const refreshAccessToken = () => {
    return new Promise((resolve, reject) => {
        redditAccessTokenGenerator.getToken()
            .then((token) => { accessToken = token; resolve(); })
            .catch((error) => { reject(error) });
    })
}

// SAUCY! RedditSauce!
class RedditSauce {
    constructor(subreddit, sort = "hot", maxResults = 3) {
        this.remotePager = new RemoteDataPager(this.urlGenerator.bind(this), getRequestHeaders());
        this.dataPager = new DataPager(this.remotePager, maxResults, this.dataParser.bind(this));

        this.subreddit = subreddit;
        this.sort = sort;
        this.nextPageToken = "";
    }

    // Call this method first! An access token must be retrieved from the server first before use.
    static initialise() {
        // If accessToken is already set, resolve
        if (accessToken !== "") {
            return Promise.resolve();
        }
        // Otherwise get an access token before resolving
        else {
            return refreshAccessToken();
        }
    }

    // Generate the url to get JSON data from
    urlGenerator(page) {
        // generate url
        let url = `https://oauth.reddit.com/r/${this.subreddit}/${this.sort}.json`;
        if (this.nextPageToken !== "") {
            url += `?after=${this.nextPageToken}`;
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

if (accessToken === "") {
    refreshAccessToken();
}

export default RedditSauce;