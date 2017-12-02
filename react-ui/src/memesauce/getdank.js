// By the dankness invested in me by nobody in particular
// I hereby declare this project downright stupid
import ImgurSauce from './imgur.js';
import YouTubeSauce from './youtube.js';
import { randomMerge } from '../Util.js';

const pageSize = 9;

class DankEngine {
    constructor() {
        this.imgurSauce_cats = new ImgurSauce("cats", "time", "week", 3);
        this.imgurSauce_dank = new ImgurSauce("dank", "viral", "week", pageSize);
        this.imgurSauce_funny = new ImgurSauce("funny", "time", "week", pageSize);
        this.youtubeSauce_dank = new YouTubeSauce("meme", 3);
        this.youtubeSauce_funny = new YouTubeSauce("funny", 3);
        this.youtubeSauce_grandayy = new YouTubeSauce("grandayy", 3);
    }

    getNext() {
        return new Promise((resolve, reject) => {

            Promise.all([
                this.imgurSauce_cats.getNext(),
                this.imgurSauce_dank.getNext(),
                this.imgurSauce_funny.getNext(),
                this.youtubeSauce_dank.getNext(),
                this.youtubeSauce_funny.getNext(),
                this.youtubeSauce_grandayy.getNext()
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