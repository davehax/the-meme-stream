import RemoteDataPager, { DataPager } from './datapager.js';

const Moment = require('moment');
const apiKey = "AIzaSyDoOJW_GQD644vSrDlAew3Bpg9JipGSuhM";

// Exclusions built from results obtained while testing
const qExclusions = "-" + [
    "kittydog",
    "anime",
    "furry",
    "original+meme"
].join(" -");

// get("https://content.googleapis.com/youtube/v3/search?maxResults=25&part=snippet&q=surfing&type=video&key=AIzaSyDoOJW_GQD644vSrDlAew3Bpg9JipGSuhM")
//     .then((data) => console.log(data))
//     .catch((error) => console.error(error));

class YouTubeSauce {
    constructor(query, maxResults) {
        // Remote Data Pager and Data Pager objects
        this.remoteDataPager = new RemoteDataPager(this.urlGenerator.bind(this));
        this.dataPager = new DataPager(this.remoteDataPager, maxResults, this.dataParser.bind(this));

        // Our YouTube API options
        this.query = query;
        this.maxResults = maxResults;
        this.nextPageToken = "";
    }

    urlGenerator(page) {
        let publishedAfter = new Moment().subtract(1, "months").format("YYYY-MM-DDTHH:mm:ss") + "Z";
        let url = `https://content.googleapis.com/youtube/v3/search?maxResults=50&part=snippet&q=${this.query} ${qExclusions}&order=viewCount&type=video&videoDuration=short&videoEmbeddable=true&relevanceLanguage=en&safeSearch=none&publishedAfter=${publishedAfter}&key=${apiKey}`
        if (this.nextPageToken !== "") {
            url += `&nextPageToken=${this.nextPageToken}`;
        }
        return `${url}&_=${new Date().getTime()}`;
    }

    getNext() {
        return this.dataPager.getNext();
    }

    dataParser(data) {
        // extract next page token if present
        if (typeof(data.nextPageToken) !== "undefined") {
            this.nextPageToken = data.nextPageToken;
        }
        else {
            this.nextPageToken = "";
        }

        // convert to the data type expected by our Card component
        let items = data.items.map((item) => {
            let videoUrl = `https://www.youtube.com/watch?v=${item.id.videoId}`;
            let videoEmbedUrl = `https://www.youtube.com/embed/${item.id.videoId}`;
            let videoDownloadUrl = `https://keepvid.com/?url=${encodeURIComponent(videoUrl)}`;

            return {
                __type: "youtube",
                title: item.snippet.title,
                preview: {
                    mediaType: "iframe",
                    lowResUrl: videoEmbedUrl,
                    highResUrl: videoEmbedUrl,
                    downloadOverride: videoDownloadUrl
                },
                media: [{
                    mediaType: "iframe",
                    lowResUrl: videoEmbedUrl,
                    highResUrl: videoEmbedUrl,
                    downloadOverride: videoDownloadUrl
                }]
            }
        });

        return items;
    }
}

export default YouTubeSauce;
