import { getJson } from '../Util.js';

let accessToken = "";
let expireTimeStamp = "";
let isGettingToken = false;
let getTokenPromise = Promise.reject();
let inDevelopment = window.location.href.indexOf("http://localhost") === 0;

// "Private" functions / variables

const getAccessToken = () => {
    // We have to contact our server as the process involves Client ID and >> Client Secret <<
    // Which we can't just go around spilling anywhere!
    let refreshTokenUrl_production = "/reddit/token";
    let refreshTokenUrl_development = "http://localhost:5000/reddit/token";
    let refreshTokenUrl = inDevelopment ? refreshTokenUrl_development : refreshTokenUrl_production;

    return new Promise((resolve, reject) => {
        getJson(refreshTokenUrl)
            .then((res) => resolve(res))
            .catch((error) => reject(error))
    });
}

// Class to get a reddit API access token
class RedditAccessTokenGenerator {
    getToken() {
        // If the current access token is valid then resolve it
        if (accessToken !== "" && new Date().getTime() > expireTimeStamp) {
            return Promise.resolve(accessToken);
        }
        // Access token not gotten or is now invalid
        else if (isGettingToken === false) {
            // Set flag
            isGettingToken = true;

            // Get token
            getTokenPromise = new Promise((resolve, reject) => {
                getAccessToken()
                    .then((res) => {
                        // Set our "private" variables
                        accessToken = res.access_token;
                        expireTimeStamp = new Date().getTime() + (res.expires_in * 1000);
                        // Resolve the access token
                        resolve(accessToken);
                        // Set flag
                        isGettingToken = false;
                    })
                    .catch((error) => {
                        reject(error);
                        isGettingToken = false;
                    });
            });

            return getTokenPromise;
        }
        // Access token not gotten or is now invalid, and we're already trying to get a new access token
        else {
            return getTokenPromise;
        }
    }
}

const redditAccessTokenGenerator = new RedditAccessTokenGenerator();

// Easy "singleton" as a module
export default redditAccessTokenGenerator;