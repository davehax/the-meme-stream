import React, { Component } from 'react';
import 'bulma/css/bulma.css';
import './App.css';
import dankEngine from './memesauce/getdank.js';
import InfiniteScroll from 'react-infinite-scroller';
import Card from './Card.js';

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

    // Lifecycle - component did mount
    componentDidMount() {
        // Fetch data 
        dankEngine.initialise()
            .then(() => dankEngine.getNext())
            .then(function (data) {
                this.setState({
                    items: data
                });
            }.bind(this))
            .catch((error) => {
                console.error(error);
            })
    }

    // Load more data from the dank engine
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
            <div className="app" ref="app">
                <section className="hero is-danger is-bold">
                    <div className="hero-body">
                        <div className="container has-text-centered">
                            <h1 className="title">The Meme Stream</h1>
                            <h2 className="subtitle">Memeing at the speed of light</h2>
                        </div>
                    </div>
                </section>

                {this.state.items.length ? (
                    <InfiniteScroll
                        pageStart={0}
                        loadMore={this.loadMore}
                        hasMore={true}
                        loader={loading}
                        threshold={750}
                        useWindow={false}
                    >
                        <section className="section">
                            <div className="container">
                                <Memes items={this.state.items} />
                            </div>
                        </section>
                    </InfiniteScroll>
                ) : <HellYeahLoading />}

            </div>
        );
    }
}

// Hell Yeah LOADING!
const HellYeahLoading = () => {
    return (
        <div className="fullscreen-loader hero is-danger is-bold">
            <div className="centered">
                <h1 className="title">L O A D I N G</h1>
                <p>Memes incoming!</p>
            </div>
        </div>
    )
}

// Memes component
const Memes = ({ items, mapper }) => {
    let chunkedItems = _.chunk(items, 3);

    return (
        chunkedItems.map((chunk, idx) => <Row items={chunk} key={idx} />)
    )
}

// Row component
const Row = ({ items, mapper }) => {
    return (
        <div className="columns">
            {items.map((item, idx) => {
                if (item.__type === "imgur") {
                    return <Card className="style-imgur" title={item.title} type="imgur" items={item} key={idx} onModalOpen={onModalOpen} onModalClose={onModalClose} />
                }
                else if (item.__type === "youtube") {
                    return <Card className="style-youtube" title={item.title} type="youtube" items={item} key={idx} />
                }
                else if (item.__type === "reddit") {
                    return <Card className="style-reddit" title={item.title} type="reddit" items={item} key={idx} onModalOpen={onModalOpen} onModalClose={onModalClose} />
                }
                else if (item.__type === "twitter") {
                    return <Card className="style-twitter" title={item.title} type="twitter" items={item} key={idx} onModalOpen={onModalOpen} onModalClose={onModalClose} />
                }
                else {
                    window.console && console.warn && (console.warn("Unsupported item detected") && console.warn(item))
                    return null
                }
            })}
        </div>
    )
}


const onModalOpen = () => {
    document.querySelector("body").style.overflow = "hidden";
    document.querySelector("html").style.overflow = "hidden";
}

const onModalClose = () => {
    document.querySelector("body").style.overflow = "auto";
    document.querySelector("html").style.overflow = "auto";
}

export default App;
