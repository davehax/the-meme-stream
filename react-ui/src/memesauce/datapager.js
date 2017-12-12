import { getJson } from '../Util.js';

// Remote Data Pager class
class RemoteDataPager {
    constructor(urlGenerator, additionalHeaders) {
        this.page = 0;
        this.urlGenerator = urlGenerator;
        this.additionalHeaders = additionalHeaders || new Headers({ "accept": "application/json" });
    }

    updateHeaders(additionalHeaders) {
        this.additionalHeaders = additionalHeaders;
    }

    getNext() {
        this.page++;
        return this.getCurrentPage();
    }

    getPrev() {
        this.page--;
        return this.getCurrentPage();
    }

    getCurrentPage() {
        let url = this.urlGenerator(this.page);

        return new Promise((resolve, reject) => {
            getJson(url, this.additionalHeaders)
                .then((data) => { resolve(data); })
                .catch((error) => { reject(error) });
        })
    }
}

// Data Pager
class DataPager {
    constructor(remotePager, pageSize, dataParser) {
        // Remote Pager object
        this.remotePager = remotePager;
        // Track array position variables
        this.results = [];
        this.pageSize = pageSize;
        this.position = 0;
        // Data Parser
        this.dataParser = dataParser;
    }

    // Get next page
    getNext() {
        return new Promise((resolve, reject) => {
            // If the position is outside the results array boundary,
            // or the requested page requires additional data to be loaded, then
            if (this.position >= this.results.length - 1 || this.position + this.pageSize >= this.results.length - 1) {
                // We need to load the next page from the API before returning results
                this.internalLoadNextPage()
                    .then(function() { resolve(this.internalReturnNextPage()); }.bind(this))
                    .catch((error) => { reject(error); })
            }
            // Otherwise retrieve directly from the array
            else {
                resolve(this.internalReturnNextPage());
            }
        });
    }

    // Internal functions
    internalLoadNextPage() {
        return new Promise((resolve, reject) => {

            this.remotePager.getNext()
                .then(function(data) {
                    // parse data
                    data = this.dataParser(data);

                    // Add array to end of existing array
                    this.results = this.results.concat(data);
                    // Empty resolve - this function must not be used to directly retrieve the next lot of data
                    resolve();
                }.bind(this)) // bind(this) to keep 'this' context
                .catch((error) => {  reject(error) })

        });
    }

    internalReturnNextPage() {
        let dataSlice = this.results.slice(this.position, this.position + this.pageSize);
        this.position += this.pageSize;
        return dataSlice;
    }
}

export default RemoteDataPager;
export {
    DataPager
};