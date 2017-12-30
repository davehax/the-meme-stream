import RemoteDataPager, { DataPager } from './datapager.js';

// Client ID: 7efb2775425b24a

const getHeaders = new Headers({
    "accept": "application/json",
    "authorization": "Client-ID 7efb2775425b24a"
});

const getThumbnailLink = (url) => {
    // insert 'l' before the last '.' in the thumbnail URL
    // http://bitmapcake.blogspot.com.au/2015/05/imgur-image-sizes-and-thumbnails.html
    let thumbnailArray = url.split(".");
    // If the image is not a gif
    if (thumbnailArray[thumbnailArray.length - 1].toLowerCase() !== "gif") {
        thumbnailArray[thumbnailArray.length - 2] += "l";
    }
    // Join the array element with the same character we split the original string with
    return thumbnailArray.join(".");
}

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
        // Convert imgur API response into object(s) usable by our "Card" class
        let items = data.data.map((item) => {
            // Original photo to show
            let preview = item.link;
            if (item.is_album) {
                // extract image from images array
                let coverImage = item.images.find((image) => image.id === item.cover);
                if (typeof (coverImage) !== "undefined") {
                    preview = coverImage.link;
                }
                else {
                    preview = `https://i.imgur.com/${item.cover}.jpg`; // fallback
                }
            }

            // copy into new variable for downloading
            let previewDownload = preview;
            preview = getThumbnailLink(preview);

            // Preview Object
            let previewObj = {
                mediaType: "image",
                lowResUrl: preview,
                highResUrl: previewDownload
            }

            // Media Array
            let mediaArr = [];

            if (!item.is_album) {
                mediaArr = [previewObj];
            }
            else {
                mediaArr = item.images.map((image) => {
                    return {
                        mediaType: "image",
                        lowResUrl: image.link,
                        highResUrl: image.link
                    }
                });
            }

            // Finally, return our object
            return {
                __type: "imgur",
                title: item.title,
                preview: previewObj,
                media: mediaArr
            }

        })

        return items;
    }
}

export default ImgurSauce;