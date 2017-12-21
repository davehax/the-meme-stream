import React, { Component } from 'react';

class ItemTwitter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalIsActive: false
        }

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
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

    render() {
        let title = this.props.item.text;
        let entities = this.props.item.entities;

        if (typeof (this.props.item.extended_entities) !== "undefined") {
            entities = this.props.item.extended_entities;
        }

        let media = entities.media[0];
        
        // Build first display card component
        let component = null;
        if (media.type === "photo" || media.type === "animated_gif") {
            component = <TwitterPhoto media={media} title={title} onOpenClick={this.openModal} />;
        }
        else if (media.type === "video") {
            component = <TwitterVideo media={media} title={title} onOpenClick={this.openModal} />;
        }

        // show / hide modal using classes
        let modalClass = ["modal"];
        if (this.state.modalIsActive) {
            modalClass.push("is-active");
        }
        modalClass = modalClass.join(" ");

        return (
            <div className="column">
                {component}

                <div className={modalClass} ref="modal">
                    <div className="modal-background" onClick={this.closeModal}></div>
                    <div className="modal-content">
                        {this.state.modalIsActive ? (
                            entities.media.map((media, idx) => {
                                if (media.type === "photo" || media.type === "animated_gif") {
                                    return <TwitterPhoto media={media} title={title} />;
                                }
                                else if (media.type === "video") {
                                    return <TwitterVideo media={media} title={title} />;
                                }
                                else {
                                    return null;
                                }
                            })
                        ) : null}
                    </div>
                    <button className="modal-close is-large" aria-label="close" onClick={this.closeModal}></button>
                </div>
            </div>
        );
    }
}

const TwitterPhoto = ({ media, title, onOpenClick }) => {
    function onOpenClickProxy(e) {
        if (typeof(onOpenClick) === "function") {
            onOpenClick.apply(this, arguments);
        }
    }

    let photoCardStyle = {};
    let photoCardClass = ["image"];

    if (typeof(onOpenClick) === "function") { 
        photoCardStyle.cursor = "pointer";

        photoCardClass.push("image-alt");
        photoCardClass.push("is-square");
    }

    return (
        <div className="card style-twitter">
            <div className="card-header">
                <h3 className="card-header-title">{title}</h3>
            </div>
            <div className="card-image" onClick={onOpenClickProxy} style={photoCardStyle}>
                <figure className={photoCardClass.join(" ")}>
                    <img src={media.media_url_https} alt="" />
                </figure>
            </div>
            <footer className="card-footer">
                {typeof(onOpenClick) === "function" ? <a className="card-footer-item" onClick={onOpenClick}>Open</a> : null }
                <a className="card-footer-item" download={media.media_url_https} href={media.media_url_https}>
                    <span className="icon has-text-info">
                        <i className="fa fa-arrow-circle-o-down" aria-hidden="true"></i>
                    </span>
                    <span>Download</span>
                </a>
            </footer>
        </div>
    )
}

const TwitterVideo = ({ media, title, onOpenClick }) => {
    // get mp4 source
    let videos = media.video_info.variants.filter((variant) => variant.content_type === "video/mp4");
    // Set the source to the first video (default)
    let videoSrc = videos[0].url;
    // If there are multiple sources, grab the middle(ish) one that should be a lower bitrate
    if (videos.length > 1) {
        videoSrc = videos[Math.round(videos.length / 2)].url;
    }

    // calculate padding required to correctly display the video
    let aspectRatio = media.video_info.aspect_ratio;
    let paddingTop = (aspectRatio[1] / aspectRatio[0]) * 100;
    paddingTop = `${paddingTop}%`;

    return (
        <div className="card style-twitter">
            <div className="card-header">
                <h3 className="card-header-title">{title}</h3>
            </div>
            <div className="card-video" style={{ cursor: "pointer" }}>
                <figure className="video" style={{
                    "position": "relative",
                    "paddingTop": paddingTop
                }}>
                    <video src={videoSrc} alt="" preload="metadata" controls allowFullScreen onClick={toggleVideo}></video>
                </figure>
            </div>
            <footer className="card-footer">
            {typeof(onOpenClick) === "function" ? <a className="card-footer-item" onClick={onOpenClick}>Open</a> : null }
                <a className="card-footer-item" download={videoSrc} href={videoSrc}>
                    <span className="icon has-text-info">
                        <i className="fa fa-arrow-circle-o-down" aria-hidden="true"></i>
                    </span>
                    <span>Download</span>
                </a>
            </footer>
        </div>
    )
}

const toggleVideo = (e) => {
    e.preventDefault();
    e.currentTarget.paused ? e.currentTarget.play() : e.currentTarget.pause();
}

export default ItemTwitter;