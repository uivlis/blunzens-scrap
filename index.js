const { Client } = require('@conversationai/perspectiveapi-js-client');
const osmosis = require('osmosis');
const walker = require('puppeteer-walker')();
const puppeteer = require('puppeteer');
const { bluzelle } = require('./blzjs/src/main.js');
const Hashes = require('jshashes');
const googleTrends = require('google-trends-api');
const qs = require('querystringify');
const chrono = require('chrono-node');

require('events').EventEmitter.prototype._maxListeners = 1000;
require('events').defaultMaxListeners = 1000;

require('dotenv').config();

const perspective = new Client(process.env.PERSPECTIVE_API_KEY);

const config = require('./blz-config.js');

const main = async () => {

    let buzz = [];

    console.log();

    let blz;

    try {
        blz = await bluzelle({
            address: config.address,
            mnemonic: config.mnemonic,
            uuid: "blunzens",
            endpoint: config.endpoint,
            chain_id: config.chain_id
        });
    } catch (e) {
        console.error(e.message);
    }

    googleTrends.realTimeTrends({
        geo: 'US'
    }).then(res => {
        JSON.parse(res).storySummaries.trendingStories.map(story => {
            story.entityNames.map(async entity => {

                osmosis
                    .get('https://duckduckgo.com/html/' + qs.stringify({q: entity}, true))
                    // .click('[data-value="-2"]')
                    .find('.result__body')
                    .set({
                        snippets: '.result__snippet',
                        tempLink: '.result__url',
                        title: '.result__title',
                    }).data(function(d) {
                        console.log("\n\n" + d.snippets);
                        console.log("\n\n" + d.tempLink);
                        console.log("\n\n" + d.title);
                    }).error(console.error)
                    .log(console.log)
                    .debug(console.debug);

            })
        })
    }).catch(e => {
        console.error(e.message);
    });

    // const text = "something inflamatory";

    // const analysis = await perspective.getScores(text);

    // const speech = JSON.stringify({
    //     author: "somebody",
    //     text: text,
    //     platform: "Twitter",
    //     tempLink: "url/path/to/text",
    //     date: "03/20/2020",
    //     censorability: ((analysis.TOXICITY - analysis.SPAM) + 1) / 2.0
    // })

    // const id = new Hashes.SHA256().hex(speech);

    // try {
    //     let res = await blz.create(id, speech, config.gas_params);
    //     successPrint(res);
    //     res = await blz.read(id);
    //     successPrint(JSON.parse(res));
    // } catch(e) {
    //     console.error(e.message);
    // };
}

main();

function successPrint(res) {
    console.log(typeof res != 'undefined' ? res : 'success');
}