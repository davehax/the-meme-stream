import RemoteDataPager, { DataPager } from './datapager.js';

// Client ID: 7efb2775425b24a

const getHeaders = new Headers({
    "accept": "application/json",
    "authorization": "Client-ID 7efb2775425b24a"
});

class ImgurSauce {
    constructor(terms, sort, dateWindow, pageSize) {
        // Our remote data pager
        this.remotePager = new RemoteDataPager(this.urlGenerator.bind(this), getHeaders);
        this.dataPager = new DataPager(this.remotePager, pageSize, this.dataParser);
        // ^^^ .bind(this) so the "this" context is preserved when the function is used as a callback ^^^

        // Imgur API vars
        this.terms = terms;
        this.sort = sort;
        this.dateWindow = dateWindow;
    }

    // url generator function
    urlGenerator(page) {
        page -= 1; // imgur API starts at page 0 for results
        return `https://api.imgur.com/3/gallery/search/${this.sort}/${this.dateWindow}/${page}?q=${this.terms}`;
    }

    getNext() {
        return this.dataPager.getNext();
    }

    dataParser(data) {
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