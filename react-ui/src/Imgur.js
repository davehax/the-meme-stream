import React, { Component } from 'react';
import { saveFile } from './Util.js';

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
                <div className="card style-imgur">
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
                        <a className="card-footer-item" onClick={this.downloadAsset} download={thumbnailDownload}>
                            <span className="icon has-text-info">
                                <i className="fa fa-arrow-circle-o-down" aria-hidden="true"></i>
                            </span>
                            <span>Download</span>
                        </a>
                    </footer>
                </div>

                {/* Modal! */}
                <div className={modalClass} ref="modal">
                    <div className="modal-background" onClick={this.closeModal}></div>
                    <div className="modal-content">
                        {this.state.modalIsActive ? (
                            modalImages.map((image, idx) => {
                                return (
                                    <div className="card style-imgur" key={image.id} rel={image.id} download={image.link} style={{ marginBottom: "1.5rem" }}>
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
                                            <a className="card-footer-item" onClick={this.downloadAsset} download={image.link}>
                                                <span className="icon has-text-info">
                                                    <i className="fa fa-arrow-circle-o-down" aria-hidden="true"></i>
                                                </span>
                                                <span>Download</span>
                                            </a>
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

export default ItemImgur;