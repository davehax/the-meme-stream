import RemoteDataPager, { DataPager } from './datapager.js';

const getHeaders = new Headers({
    "accept": "application/json",
    "authorization": "Client-ID 7efb2775425b24a"
});

class ImgurSauce {
    constructor(terms, sort, dateWindow, pageSize) {
        // Our remote data pager
        this.remotePager = new RemoteDataPager(this.urlGenerator.bind(this), getHeaders);
        this.dataPager = new DataPager(this.remotePager, pageSize, this.dataStamper);
        // ^^^ .bind(this) so the "this" context is preserved when the function is used as a callback ^^^

        // Track array position variables
        // this.pageSize = pageSize;
        // this.position = 0;

        // Imgur API vars
        this.terms = terms;
        this.sort = sort;
        this.dateWindow = dateWindow;

        // Store results as we get them ?
        // this.results = [];

        // this.getNext = this.getNext.bind(this);
    }

    // url generator function
    urlGenerator(page) {
        page -= 1; // imgur API starts at page 0 for results
        return `https://api.imgur.com/3/gallery/search/${this.sort}/${this.dateWindow}/${page}?q=${this.terms}`;
    }

    getNext() {
        // return new Promise((resolve, reject) => {

        //     if (this.position >= this.results.length - 1 || this.position + this.pageSize >= this.results.length - 1) {
        //         // We need to load the next page from the API before returning results
        //         this.internalLoadNextPage()
        //             .then(function() { resolve(this.internalReturnNextPage()); }.bind(this))
        //             .catch((error) => { reject(error); })
        //     }
        //     else {
        //         resolve(this.internalReturnNextPage());
        //     }

        // });
        return this.dataPager.getNext();
    }

    // Internal functions
    // internalLoadNextPage() {
    //     return new Promise((resolve, reject) => {

    //         this.remotePager.getNext()
    //             .then(function(data) {
    //                 // Add array to end of existing array
    //                 this.results = this.results.concat(data.data);

    //                 // Empty resolve - this function must not be used to directly retrieve the next lot of data
    //                 resolve();
    //             }.bind(this))
    //             .catch((error) => { reject(error) })

    //     });
    // }

    // internalReturnNextPage() {
    //     let dataSlice = this.results.slice(this.position, this.position + this.pageSize);
    //     this.position += this.pageSize;
    //     return dataSlice;
    // }

    dataStamper(data) {
        // extract "data" property
        data = data.data; 
        // add a "__type" property with value "imgur" for use in our React display components
        for (let i = 0; i < data.length; i++) {
            data[i].__type = "imgur";
        }

        return data;
    }
}

export default ImgurSauce;