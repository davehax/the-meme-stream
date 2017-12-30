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

// Refresh Access Token
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

// Get Media Type
const getMediaType = (type) => {
    if (type === "photo" || type === "animated_gif") {
        return "image";
    }
    else {
        return "video";
    }
}

// Build Card Object
const buildCardObject = (media) => {
    if (media.type === "photo" || media.type === "animated_gif") {
        return buildImageCardObject(media);
    }
    else if (media.type === "video") {
        return buildVideoCardObject(media);
    }
    else {
        return null;
    }
}

// Build Image Card Object
const buildImageCardObject = (media) => {
    return {
        mediaType: getMediaType(media.type),
        lowResUrl: media.media_url_https,
        highResUrl: media.media_url_https
    }
}

// Build Video Card Object
const buildVideoCardObject = (media) => {
    // get mp4 source
    let videos = media.video_info.variants.filter((variant) => variant.content_type === "video/mp4");


    // Get a middle ground bitrate video for use as the lowResUrl
    let lowResSrc = videos[0].url;
    // If there are multiple sources, grab the middle(ish) one that should be a lower bitrate
    if (videos.length > 1) {
        lowResSrc = videos[Math.round(videos.length / 2)].url;
    }

    // // calculate padding required to correctly display the video
    let aspectRatio = media.video_info.aspect_ratio;
    // let paddingTop = (aspectRatio[1] / aspectRatio[0]) * 100;
    // paddingTop = `${paddingTop}%`;

    return {
        mediaType: getMediaType(media.type),
        lowResUrl: lowResSrc,
        highResUrl: videos.sort((a, b) => { return b.bitrate - a.bitrate })[0].url, // descending sort, take first
        aspectRatio: {
            w: aspectRatio[0],
            h: aspectRatio[1]
        }
    }
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

        // Build card objects from each tweet
        return tweets.map((tweet) => {

            let title = tweet.text;

            // Twitter docs recommends the use of extended_entities over entities where it exists
            let entities = tweet.entities;

            if (typeof (tweet.extended_entities) !== "undefined") {
                entities = tweet.extended_entities;
            }

            // Build preview object
            let preview = buildCardObject(entities.media[0]);
            preview.title = tweet.text;

            // Build card objects
            let mediaArr = entities.media.map((media) => {
                return buildCardObject(media);
            });

            return {
                __type: "twitter",
                title: tweet.text,
                preview: preview,
                media: mediaArr
            }
        });
    }
}

export default TwitterSauce;

