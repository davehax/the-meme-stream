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
    constructor(searchQuery, count = 5) {
        this.remoteDataPager = new RemoteDataPager(this.urlGenerator.bind(this));
        this.dataPager = new DataPager(this.remoteDataPager, count, this.dataParser.bind(this));

        this.nextResultsUrl = undefined;
        this.searchQuery = encodeURIComponent(searchQuery);
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

    // Generate the next URL to request data from
    // https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline
    // https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
    // https://developer.twitter.com/en/docs/tweets/search/guides/standard-operators
    urlGenerator(page) {
        let url = `${proxyUrl}?url=${encodeURIComponent(`/search/tweets.json?q=${this.searchQuery}&result_type=recent&count=100&lang=en`)}`;

        if (typeof(this.nextResultsUrl) !== "undefined") {
            url = `${proxyUrl}?url=${encodeURIComponent(`/search/tweets.json${this.nextResultsUrl}`)}`;
        }

        return `${url}&token=${accessToken}`;
    }

    getNext() {
        return this.dataPager.getNext();
    }

    // Parse the data received in the DataPager class
    dataParser(data) {
        this.nextResultsUrl = data.search_metadata.next_results;

        // Filter out tweets without media
        data = data.statuses.filter((item) => typeof(item.entities.media) !== "undefined");

        // Stamp the tweets with __type = "twitter"
        for (let i = 0; i < data.length; i++) {
            data[i].__type = "twitter";
        }

        return data;
    }
}

export default TwitterSauce;

