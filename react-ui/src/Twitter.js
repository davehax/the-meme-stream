import React, { Component } from 'react';

class ItemTwitter extends Component {
    render() {
        let title = this.props.item.text;
        let media = this.props.item.entities.media[0];
        if (typeof (this.props.item.extended_entities) !== "undefined") {
            media = this.props.item.extended_entities.media[0];
        }

        let component = null;
        if (media.type === "photo" || media.type === "animated_gif") {
            component = <TwitterPhoto media={media} title={title} />;
        }
        else if (media.type === "video") {
            component = <TwitterVideo media={media} title={title} />;
        }

        return (
            <div className="column">
                {component}
            </div>
        );
    }
}

const TwitterPhoto = ({ media, title }) => {
    return (
        <div className="card style-twitter">
            <div className="card-header">
                <h3 className="card-header-title">{title}</h3>
            </div>
            <div className="card-image">
                <figure className="image">
                    <img src={media.media_url_https} alt="" />
                </figure>
            </div>
            <footer className="card-footer">
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

const TwitterVideo = ({ media, title }) => {
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