import React, { Component } from 'react';
// import logo from './logo.svg';
import 'bulma/css/bulma.css';
import './App.css';
// import { get } from './Util.js';
import dankEngine from './memesauce/getdank.js';
import InfiniteScroll from 'react-infinite-scroller';
import ItemImgur from './Imgur.js';
import ItemYouTube from './YouTube.js';

// Imports before Requires
let _ = require('lodash');

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
            dankEngine.getNext()
                .then(function (data) {
                    let allItems = this.state.items.concat(data);

                    this.setState({
                        items: allItems
                    }); 

                }.bind(this))
                .catch((error) => {
                    console.error(error);
                })
    }

    render() {
        let loading = (
            <section className="container has-text-white has-text-centered is-size-1">
                <i className="fa fa-bolt pulse" aria-hidden="true"></i>
            </section>
        );

        return (
            <div className="app">
                <section className="hero is-primary is-bold">
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
                                loader={loading}
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
            {items.map((item, idx) => {
                if (item.__type === "imgur") {
                    return <ItemImgur item={item} key={idx} />
                }
                else {
                    return <ItemYouTube item={item} key={idx} />
                }
            })}
        </div>
    )
}



export default App;
