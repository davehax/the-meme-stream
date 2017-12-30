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

        this.sauces = [];

        // // IMGUR
        this.sauces.push(new ImgurSauce("cats", "time", "week", pageSize));
        this.sauces.push(new ImgurSauce("dank", "viral", "week", pageSize));
        this.sauces.push(new ImgurSauce("funny", "time", "week", pageSize));

        // // YOUTUBE
        this.sauces.push(new YouTubeSauce("best memes", 2));
        this.sauces.push(new YouTubeSauce("grandayy", 1));

        // // REDDIT
        this.sauces.push(new RedditSauce("dankmemes", "hot", pageSize));
        this.sauces.push(new RedditSauce("memes", "new", pageSize));

        // // TWITTER
        // this.sauces.push(new TwitterSauce("dank memes filter:media -filter:retweets", pageSize));
        // this.sauces.push(new TwitterSauce("hilarious :) filter:native_video -filter:retweets", pageSize));
        this.sauces.push(new TwitterSauce("DailyMemesPlug", pageSize, "timeline"));
        this.sauces.push(new TwitterSauce("freememeskids", pageSize, "timeline"));
        this.sauces.push(new TwitterSauce("memes", pageSize, "timeline"));
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

            let promises = [];
            this.sauces.forEach((sauce) => {
                promises.push(
                    resolvePromise(sauce.getNext())
                );
            });
            
            Promise.all(promises)
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