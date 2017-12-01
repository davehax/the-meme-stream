import React, { Component } from 'react';
// import logo from './logo.svg';
import 'bulma/css/bulma.css';
import './App.css';
import { get } from './Util.js';
import dankEngine from './memesauce/getdank.js';
import InfiniteScroll from 'react-infinite-scroller';

// Imports before Requires
let _ = require('lodash');


// Client ID: 7efb2775425b24a

// Download a file form a url.
const saveFile = (url) => {
    // credit - https://ausdemmaschinenraum.wordpress.com/2012/12/06/how-to-save-a-file-from-a-url-with-javascript/
    // Get file name from url.
    var filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function () {
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob
        a.download = filename; // Set the file name.
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        // delete a;
        a = null;
    };
    xhr.open('GET', url);
    xhr.send();
}

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            items: []
        }

        this.loadMore = this.loadMore.bind(this);
        this.loadMore = _.throttle(this.loadMore, 500);
    }

    componentDidMount() {
        // Fetch data 

        dankEngine.getNext()
            .then(function (data) {
                this.setState({
                    items: data
                });
            }.bind(this))
            .catch((error) => {
                console.error(error);
            })
    }

    loadMore() {
        // return new Promise((resolve, reject) => {
            dankEngine.getNext()
                .then(function (data) {
                    let allItems = this.state.items.concat(data);

                    this.setState({
                        items: allItems
                    }); 

                }.bind(this))
                .catch((error) => {
                    // reject(error);
                })
        // })
    }

    render() {
        return (
            <div className="app">
                <section className="hero is-primary">
                    <div className="hero-body">
                        <div className="container">
                            <h1 className="title">The Meme Stream</h1>
                            <h2 className="subtitle">Memeing at the speed of light</h2>
                        </div>
                    </div>
                </section>
                <section className="section">
                    <div className="container">
                            {this.state.items.length ? (
                                <InfiniteScroll
                                    pageStart={0}
                                    loadMore={this.loadMore}
                                    hasMore={true}
                                    loader={<div className="loading">Loading...</div>}
                                    threshold={750}
                                >
                                    <Memes items={this.state.items} />
                                </InfiniteScroll>
                            ) : null}
                    </div>
                </section>
            </div>
        );
    }
}

// Memes component
const Memes = ({ items }) => {
    let chunkedItems = _.chunk(items, 3);

    return (
        chunkedItems.map((chunk, idx) => <Row items={chunk} key={idx} />)
    )
}

// Row component
const Row = ({ items }) => {
    return (
        <div className="columns">
            {items.map((item, idx) => <ItemImgur item={item} key={idx} />)}
        </div>
    )
}

// Item component
class ItemImgur extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalIsActive: false
        }

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.downloadAsset = this.downloadAsset.bind(this);
    }

    // Open modal
    openModal(e) {
        e.preventDefault();
        this.refs["modal"].scrollTop = 0;
        this.setState({ modalIsActive: true });
    }

    // Close modal
    closeModal(e) {
        e.preventDefault();
        this.setState({ modalIsActive: false })
    }

    // Download image/video whatever
    downloadAsset(e) {
        e.preventDefault();
        // console.log(e.target.download);
        saveFile(e.target.download);
    }

    render() {
        // Easier rendering
        let item = this.props.item;

        // show / hide modal using classes
        let modalClass = ["modal"];
        if (this.state.modalIsActive) {
            modalClass.push("is-active");
        }
        modalClass = modalClass.join(" ");

        // original photo to show
        let thumbnail = item.link;
        if (item.is_album) {
            // extract image from images array
            let coverImage = item.images.find((image) => image.id === item.cover);
            if (typeof (coverImage) !== "undefined") {
                thumbnail = coverImage.link;
            }
            else {
                thumbnail = `https://i.imgur.com/${item.cover}.jpg`; // fallback
            }
        }

        // copy into new variable for downloading
        let thumbnailDownload = thumbnail;

        // insert 'l' before the last '.' in the thumbnail URL
        // http://bitmapcake.blogspot.com.au/2015/05/imgur-image-sizes-and-thumbnails.html
        let thumbnailArray = thumbnail.split(".");
        // If the image is not a gif
        if (thumbnailArray[thumbnailArray.length - 1].toLowerCase() !== "gif") {
            thumbnailArray[thumbnailArray.length - 2] += "l";
        }
        // Join the array element with the same character we split the original string with
        thumbnail = thumbnailArray.join(".");

        // modal photos
        let modalImages = [item];
        if (item.is_album) {
            modalImages = item.images;
        }

        return (
            <div className="column">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-header-title">{item.title}</h3>
                    </div>
                    <div className="card-image" style={{ cursor: "pointer" }} onClick={this.openModal}>
                        <figure className="image image-alt is-square">
                            <img src={thumbnail} alt={item.title} />
                        </figure>
                    </div>
                    <footer className="card-footer">
                        <a className="card-footer-item" onClick={this.openModal}>Open</a>
                        <a className="card-footer-item" onClick={this.downloadAsset} download={thumbnailDownload}>Download</a>
                    </footer>
                </div>

                {/* Modal! */}
                <div className={modalClass} ref="modal">
                    <div className="modal-background" onClick={this.closeModal}></div>
                    <div className="modal-content">
                        {this.state.modalIsActive ? (
                            modalImages.map((image, idx) => {
                                return (
                                    <div className="card" key={image.id} rel={image.id} download={image.link} style={{ marginBottom: "1.5rem" }}>
                                        {image.description !== null ?
                                            <div className="card-header">
                                                <h3 className="card-header-title">{image.description}</h3>
                                            </div> : null}
                                        <div className="card-image">
                                            <figure className="image">
                                                <img src={image.link} alt={image.description} />
                                            </figure>
                                        </div>
                                        <footer className="card-footer">
                                            <a className="card-footer-item" onClick={this.downloadAsset} download={image.link}>Download</a>
                                        </footer>
                                    </div>
                                )
                        })
                        ) : null}
                    </div>
                    <button className="modal-close is-large" aria-label="close" onClick={this.closeModal}></button>
                </div>
            </div>
        )
    }
}

export default App;
