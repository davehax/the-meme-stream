import { getJson } from '../Util.js';

let accessToken = "";
let expireTimeStamp = "";
let isGettingToken = false;
let getTokenPromise = Promise.reject();

// "Private" functions / variables

const getAccessToken = () => {
    // We have to contact our server as the process involves Client ID and >> Client Secret <<
    // Which we can't just go around spilling anywhere!
    let refreshTokenUrl_production = "/token/reddit";
    let refreshTokenUrl_development = "http://localhost:5000/token/reddit";

    return new Promise((resolve, reject) => {
        // First, attempt to contact the server via a relative URL path
        fetch(refreshTokenUrl_production, {
            headers: {
                "Accept": "application/json"
            }
        })
        // If this succeeds, continue on with the JSON response
        // Or if it fails, continue on with a new request to the locally hosted dev server
            .then((res) => {
                if (res.ok) {
                    return res.json()
                }
                else {
                    return getJson(refreshTokenUrl_development);
                }
            })
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