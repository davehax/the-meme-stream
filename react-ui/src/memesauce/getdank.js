// By the dankness invested in me by nobody in particular
// I hereby declare this project downright stupid
import ImgurSauce from './imgur.js';
import YouTubeSauce from './youtube.js';
import RedditSauce from './reddit.js';
import { randomMerge } from '../Util.js';

const pageSize = 3;

class DankEngine {
    constructor() {
        this.imgurSauce_cats = new ImgurSauce("cats", "time", "week", pageSize);
        this.imgurSauce_dank = new ImgurSauce("dank", "viral", "week", pageSize);
        this.imgurSauce_funny = new ImgurSauce("funny", "time", "week", pageSize);
        this.youtubeSauce_funny = new YouTubeSauce("best memes", 2);
        this.youtubeSauce_grandayy = new YouTubeSauce("grandayy", 1);

        this.redditSauce_dankMemes = new RedditSauce("dankmemes", "hot", pageSize);
        this.redditSauce_dankVideos = new RedditSauce("dankvideos", "hot", pageSize);
    }

    initialise() {
        let promises = [];

        // Add promises here
        promises.push(this.redditSauce_dankMemes.initialise());

        return Promise.all(promises);
    }

    getNext() {
        return new Promise((resolve, reject) => {

            Promise.all([
                // IMGUR
                this.imgurSauce_cats.getNext(),
                this.imgurSauce_dank.getNext(),
                this.imgurSauce_funny.getNext(),
                // YouTubs
                this.youtubeSauce_funny.getNext(),
                this.youtubeSauce_grandayy.getNext(),
                // Reddit
                this.redditSauce_dankMemes.getNext(),
                this.redditSauce_dankVideos.getNext()
                // Twitter (coming soon)
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