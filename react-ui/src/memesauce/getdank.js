// By the dankness invested in me by nobody in particular
// I hereby declare this project downright stupid
import ImgurSauce from './imgur.js';

class DankEngine {
    constructor() {
        this.imgurSauce = new ImgurSauce("cats", "time", "week", 9);
    }

    getNext() {
        return new Promise((resolve, reject) => {

            this.imgurSauce.getNext()
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    reject(error);
                })

        });
    }
}

// Create an instance of our class
const dankEngine = new DankEngine();

// Export only the instance
export default dankEngine;