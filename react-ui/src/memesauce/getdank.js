// By the dankness invested in me by nobody in particular
// I hereby declare this project downright stupid
import ImgurSauce from "./imgur.js";
import YouTubeSauce from "./youtube.js";
import RedditSauce from "./reddit.js";
import TwitterSauce from "./twitter.js";
import { randomMerge, resolvePromise } from "../Util.js";

const pageSize = 3;

class DankEngine {
    constructor() {
        // IMGUR
        this.imgurSauce_cats = new ImgurSauce("cats", "time", "week", pageSize);
        this.imgurSauce_dank = new ImgurSauce("dank", "viral", "week", pageSize);
        this.imgurSauce_funny = new ImgurSauce("funny", "time", "week", pageSize);

        // YOUTUBE
        this.youtubeSauce_funny = new YouTubeSauce("best memes", 2);
        this.youtubeSauce_grandayy = new YouTubeSauce("grandayy", 1);

        // REDDIT
        this.redditSauce_dankMemes = new RedditSauce("dankmemes", "hot", pageSize);
        this.redditSauce_dankVideos = new RedditSauce("dankvideos", "hot", pageSize);

        // TWITTER
        this.twitterSauce_dankmemes = new TwitterSauce("dank memes filter:media -filter:retweets", pageSize);
        this.twitterSauce_videos = new TwitterSauce("hilarious :) filter:native_video -filter:retweets", pageSize);
        this.twitterSauce_freememeskids = new TwitterSauce("@freememeskids filter:media -filter:retweets", pageSize);
    }

    initialise() {
        let promises = [];

        // Add promises here
        promises.push(RedditSauce.initialise());
        promises.push(TwitterSauce.initialise());

        return Promise.all(promises);
    }

    getNext() {
        return new Promise((resolve, reject) => {
            // Using "resolvePromise" wrapper to prevent the application from breaking if any requests fail

            Promise.all([
                // IMGUR
                resolvePromise(this.imgurSauce_cats.getNext()),
                resolvePromise(this.imgurSauce_dank.getNext()),
                resolvePromise(this.imgurSauce_funny.getNext()),
                // YouTubs
                resolvePromise(this.youtubeSauce_funny.getNext()),
                resolvePromise(this.youtubeSauce_grandayy.getNext()),
                // Reddit
                resolvePromise(this.redditSauce_dankMemes.getNext()),
                resolvePromise(this.redditSauce_dankVideos.getNext()),
                // Twitter (coming soon)
                resolvePromise(this.twitterSauce_dankmemes.getNext()),
                resolvePromise(this.twitterSauce_videos.getNext()),
                resolvePromise(this.twitterSauce_freememeskids.getNext())
            ])
                .then(function(...sauces) {
                    let data = randomMerge.apply(this, arguments[0]);
                    resolve(data);
                })
                .catch((error) => reject(error));

        });
    }
}

// Create an instance of our class
const dankEngine = new DankEngine();

// Export only the instance
export default dankEngine;