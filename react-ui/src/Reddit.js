import React, { Component } from 'react';
import { saveFile } from './Util.js';

// Item component
class ItemReddit extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalIsActive: false
        }

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.downloadAsset = this.downloadAsset.bind(this);
        this.scrollCanceller = this.scrollCanceller.bind(this);
    }

    // Scroll canceller
    scrollCanceller(e) {
        if (e.target === e.currentTarget) {
            e.preventDefault();
        }
    }

    // Open modal
    openModal(e) {
        e.preventDefault();
        this.refs["modal"].scrollTop = 0;
        this.setState({ modalIsActive: true });
        this.props.onModalOpen();
    }

    // Close modal
    closeModal(e) {
        e.preventDefault();
        this.setState({ modalIsActive: false })
        this.props.onModalClose();
    }

    // Download image/video whatever
    downloadAsset(e) {
        e.preventDefault();
        // console.log(e.target.download);
        saveFile(e.currentTarget.download);
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

        // thumbnail
        let imagePreviewItem = item.preview.images[0];
        let thumbnail = imagePreviewItem.resolutions[imagePreviewItem.resolutions.length - 1].url;

        // copy into new variable for downloading
        let thumbnailDownload = thumbnail;

        // modal photos
        let modalImages = item.preview.images.map((image) => { return image.source });
        // let modalImages = [item.preview.images.source];

        return (
            <div className="column">
                <div className="card style-reddit">
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
                        <a className="card-footer-item" download={thumbnailDownload} href={thumbnailDownload}>
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
                                    <div className="card style-reddit" key={idx} rel={image.url} download={image.url} style={{ marginBottom: "1.5rem" }}>
                                        <div className="card-image">
                                            <figure className="image">
                                                <img src={image.url} alt={""} />
                                            </figure>
                                        </div>
                                        <footer className="card-footer">
                                            <a className="card-footer-item" download={image.url} href={image.url}>
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

export default ItemReddit;