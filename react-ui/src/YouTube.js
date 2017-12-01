import React, { Component } from 'react';

class ItemYouTube extends Component {


    render() {
        let item = this.props.item;

        return (
            <div className="column">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-header-title">{item.snippet.title}</h3>
                    </div>
                    <div className="card-video" style={{ cursor: "pointer" }}>
                        <iframe src={`https://www.youtube.com/embed/${item.id.videoId}`} allowFullScreen="true" mozallowfullscreen="true"></iframe>
                    </div>
                </div>
            </div>
        );
    }
}

export default ItemYouTube;