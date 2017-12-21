import RemoteDataPager, { DataPager } from './datapager.js';
import { getJson } from "../Util.js";

let accessToken;
let inDevelopment = window.location.href.indexOf("http://localhost") === 0;

// refresh token URL
let refreshTokenUrl = "/twitter/token";
let proxyUrl = "/twitter/proxy";

if (inDevelopment) {
    refreshTokenUrl = `http://localhost:5000${refreshTokenUrl}`;
    proxyUrl = `http://localhost:5000${proxyUrl}`;
}

const refreshAccessToken = () => {
    // We have to contact our server as the process involves Client ID and >> Client Secret <<
    // Which we can't just go around spilling anywhere!
    return new Promise((resolve, reject) => {
        getJson(refreshTokenUrl)
            .then((res) => {
                accessToken = res.access_token;
                resolve();
            })
            .catch((error) => reject(error))
    });
}

class TwitterSauce {
    constructor(query, count = 5, type = "search") {
        this.type = type;

        // Pick a URL generator to use based on the endpoint/type
        let urlGenerator = this.searchUrlGenerator.bind(this);
        if (type === "timeline") {
            urlGenerator = this.timelineUrlGenerator.bind(this);
        }

        this.remoteDataPager = new RemoteDataPager(urlGenerator);
        this.dataPager = new DataPager(this.remoteDataPager, count, this.dataParser.bind(this));

        this.nextResultsUrl = undefined;
        this.query = encodeURIComponent(query);
    }

    // Static initialise function
    static initialise() {
        if (typeof(accessToken) !== "undefined") { 
            return Promise.resolve(); 
        }
        else {
            return refreshAccessToken();
        }
    }

    getNext() {
        return this.dataPager.getNext();
    }

    // URL GENERATORS
    // Generate the next URL to request data from
    // https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline
    // https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
    // https://developer.twitter.com/en/docs/tweets/search/guides/standard-operators
    searchUrlGenerator(page) {
        let url = `${proxyUrl}?url=${encodeURIComponent(`/search/tweets.json?q=${this.query}&result_type=recent&count=100&lang=en`)}`;

        if (typeof(this.nextResultsUrl) !== "undefined") {
            url = `${proxyUrl}?url=${encodeURIComponent(`/search/tweets.json${this.nextResultsUrl}`)}`;
        }

        return `${url}&token=${accessToken}`;
    }

    timelineUrlGenerator(page) {
        let url = `${proxyUrl}?url=${encodeURIComponent(`/statuses/user_timeline.json?screen_name=${this.query}&exclude_replies=true&include_rts=false&count=100`)}`;

        if (typeof(this.nextResultsUrl) !== "undefined") {
            url += `&max_id=${this.nextResultsUrl}`;
        }

        return `${url}&token=${accessToken}`;
    }

    // Parse the data received in the DataPager class
    dataParser(data) {
        let tweets = [];
        // extract tweets + other operations based on endpoint called
        if (this.type === "search") {
            tweets = data.statuses;
            this.nextResultsUrl = data.search_metadata.next_results;
        }
        else if (this.type === "timeline") {
            tweets = data;
            this.nextResultsUrl = tweets[tweets.length - 1].id_str;
        }

        // Filter out tweets without media
        tweets = tweets.filter((item) => typeof(item.entities.media) !== "undefined");

        // Stamp the tweets with __type = "twitter"
        for (let i = 0; i < tweets.length; i++) {
            tweets[i].__type = "twitter";
        }

        return tweets;
    }
}

export default TwitterSauce;

