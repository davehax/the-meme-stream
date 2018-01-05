import React, { Component } from 'react';
import { saveFile, isEmptyString } from './Util.js';
import shallowequal from 'shallowequal';
import Observer from 'react-intersection-observer';

// Generic card component
class Card extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalIsActive: false,
            cardIsVisible: true
        }

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.downloadAsset = this.downloadAsset.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);

        // expected properties:
        // title (string)
        // className
        // forceDownload
        // type, (imgur, reddit, youtube, twitter, facebook, instagram)
        // item(s) 
        // {
        //     __type, (imgur, reddit, youtube, twitter, facebook, instagram) ??? 
        //     title, (string),
        //     preview = {
        //         mediaType, (image, video, iframe)
        //         lowResUrl, (url, low res)
        //         highResUrl, (url, higher res),
        //         downloadOverride, (url, optional)
        //         aspectRatio = { w, h } (optional, video only)
        //     },
        //     media = [{
        //         title, (optional)
        //         mediaType, (image, video, iframe)
        //         lowResUrl, (url, low res)
        //         highResUrl, (url, higher res)
        //         downloadOverride, (url, optional)
        //         aspectRatio = { w, h } (optional, video only)
        //     }]
        // }
    }

    // Compare props and state with new props and new state -- if there's no diff then we don't need to render!
    shouldComponentUpdate(nextProps, nextState) {
        return !shallowequal(nextProps, this.props) || !shallowequal(nextState, this.state);
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
        this.setState({ modalIsActive: false });
        this.props.onModalClose();
    }

    // Force download asset - use when native download attribute doesn't work
    downloadAsset(e) {
        e.preventDefault();
        saveFile(e.currentTarget.download);
    }

    onVisibilityChange(isVisible) {
        let card = this.refs["card"];
        let width = card ? card.clientWidth : 100;
        let height = card ? card.clientHeight : 100;

        this.setState({
            cardIsVisible: isVisible,
            placeholderWidth: width,
            placeholderHeight: height
        });
    }

    render() {
        // Preview item
        let preview = null;
        if (this.props.items.preview.mediaType === "image") {
            preview = <ImagePreview media={this.props.items.preview} title={this.props.title} openModal={this.openModal} />
        }
        else if (this.props.items.preview.mediaType === "video") {
            preview = <VideoPreview media={this.props.items.preview} title={this.props.title} openModal={this.openModal} />
        }
        else if (this.props.items.preview.mediaType === "iframe") {
            preview = <IFramePreview media={this.props.items.preview} title={this.props.title} />
        }

        // Modal class
        // show / hide modal using classes
        let modalClass = ["modal"];
        if (this.state.modalIsActive) {
            modalClass.push("is-active");
        }
        modalClass = modalClass.join(" ");

        // Additional footer download props
        let additionalFooterProps = {};
        if (this.forceDownload) {
            additionalFooterProps.onClick = this.downloadAsset;
        }

        // Change download url if an override is provided
        let previewDownloadUrl = this.props.items.media[0].highResUrl;
        if (this.props.items.preview.downloadOverride) {
            previewDownloadUrl = this.props.items.preview.downloadOverride;
        }

        return (
            <div className="column">
                {/* Use the new IntersectionObserver react wrapper to act as a virtual viewport */}
                <Observer onChange={this.onVisibilityChange}>
                    {this.state.cardIsVisible === true ? (
                        <div className={`card ${this.props.className}`} ref="card">
                            {/* Title */}
                            <div className="card-header">
                                {!isEmptyString(this.props.title) ? <h3 className="card-header-title">{this.props.title}</h3> : null}
                            </div>

                            {/* Content */}
                            {preview}

                            {/* Footer */}
                            <footer className="card-footer">
                                {this.props.type !== "youtube" ? <a className="card-footer-item" onClick={this.openModal}>Open</a> : null}
                                <a className="card-footer-item" download={previewDownloadUrl} href={previewDownloadUrl}>
                                    <span className="icon has-text-info">
                                        <i className="fa fa-arrow-circle-o-down" aria-hidden="true"></i>
                                    </span>
                                    <span>Download</span>
                                </a>
                            </footer>
                        </div>

                    ) : (
                        <div style={{ width: `${this.state.placeholderWidth}px`, height: `${this.state.placeholderHeight}px` }} />
                    )}
                </Observer>

                {/* Modal */}
                {this.props.items.media.length ? (
                    <div className={modalClass} ref="modal">
                        <div className="modal-background" onClick={this.closeModal}></div>
                        <div className="modal-content">
                            {this.state.modalIsActive ? (
                                this.props.items.media.map((media, idx) => {

                                    // Get Content element
                                    let content = null;
                                    if (media.mediaType === "image") {
                                        content = <ImageContent media={media} />
                                    }
                                    else if (media.mediaType === "video") {
                                        content = <VideoContent media={media} />
                                    }
                                    else if (media.mediaType === "iframe") {
                                        content = <IFrameContent media={media} />
                                    }

                                    // Get download url
                                    let downloadUrl = media.highResUrl;
                                    if (media.downloadOverride) {
                                        downloadUrl = media.downloadOverride;
                                    }

                                    return (
                                        <div className={`card ${this.props.className}`} key={idx} download={media.highResUrl} style={{ marginBottom: "1.5rem" }}>
                                            {!isEmptyString(media.title) ?
                                                <div className="card-header">
                                                    <h3 className="card-header-title">{media.title}</h3>
                                                </div> : null}

                                            {content}

                                            <footer className="card-footer">
                                                <a className="card-footer-item" href={downloadUrl} download={downloadUrl} {...additionalFooterProps}>
                                                    <span className="icon has-text-info"><i className="fa fa-arrow-circle-o-down" aria-hidden="true"></i></span>
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
                ) : null}
            </div>
        )
    }
}

// Preview Content
const IFramePreview = ({ media, title }) => {
    return (
        <div className="card-video has-iframe" style={{ cursor: "pointer" }}>
            <iframe src={media.lowResUrl} allowFullScreen="true" mozallowfullscreen="true" title={title}></iframe>
        </div>
    )
}

const ImagePreview = ({ media, title, openModal }) => {
    return (
        <div className="card-image" style={{ cursor: "pointer" }} onClick={openModal}>
            <figure className="image image-alt is-square">
                <img src={media.lowResUrl} alt={title} />
            </figure>
        </div>
    )
}

const VideoPreview = ({ media, title }) => {
    let paddingTop = "100%";
    if (media.aspectRatio) {
        paddingTop = media.aspectRatio.h / media.aspectRatio.w * 100;
        paddingTop = `${paddingTop}%`;
    }

    return (
        <div className="card-video" style={{ cursor: "pointer" }}>
            <figure className="video" style={{
                "position": "relative",
                "paddingTop": paddingTop
            }}>
                <video src={media.lowResUrl} alt="" preload="metadata" controls allowFullScreen onClick={toggleVideo}></video>
            </figure>
        </div>
    )
}

// Modal Content
const IFrameContent = ({ media }) => {
    let title = media.title || media.highResUrl;

    return (
        <div className="card-video has-iframe" style={{ cursor: "pointer" }}>
            <iframe src={media.highResUrl} allowFullScreen="true" mozallowfullscreen="true" title={title}></iframe>
        </div>
    )
}

const ImageContent = ({ media }) => {
    return (
        <div className="card-image">
            <figure className="image">
                <img src={media.highResUrl} alt={media.title} />
            </figure>
        </div>
    );
}

const VideoContent = ({ media }) => {
    let paddingTop = "100%";
    if (media.aspectRatio) {
        paddingTop = media.aspectRatio.h / media.aspectRatio.w * 100;
        paddingTop = `${paddingTop}%`;
    }

    return (
        <div className="card-video" style={{ cursor: "pointer" }}>
            <figure className="video" style={{
                "position": "relative",
                "paddingTop": paddingTop
            }}>
                <video src={media.highResUrl} alt="" preload="metadata" controls allowFullScreen onClick={toggleVideo}></video>
            </figure>
        </div>
    )
}

// Extra...
const toggleVideo = (e) => {
    e.preventDefault();
    e.currentTarget.paused ? e.currentTarget.play() : e.currentTarget.pause();
}


export default Card;