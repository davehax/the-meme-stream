import React, { Component } from 'react';
// import logo from './logo.svg';
import 'bulma/css/bulma.css';
import './App.css';
import { get } from './Util.js';
import dankEngine from './memesauce/getdank.js';
import InfiniteScroll from 'react-infinite-scroller';
import ItemImgur from './Imgur.js';

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
            {items.map((item, idx) => {
                if (item.__type === "imgur") {
                    return <ItemImgur item={item} key={idx} />
                }
            })}
        </div>
    )
}



export default App;
