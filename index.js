const { Client } = require('@conversationai/perspectiveapi-js-client');
const osmosis = require('osmosis');
const { bluzelle } = require('bluzelle');
const Hashes = require('jshashes');
const googleTrends = require('google-trends-api');
const qs = require('querystringify');
require('events').EventEmitter.prototype._maxListeners = 1000;
require('events').defaultMaxListeners = 1000;
require('dotenv').config();
const CENSORABILITY_THRESHOLD = 0.6;
const perspective = new Client(process.env.PERSPECTIVE_API_KEY);

const main = async () => {

    let blz = bluzelle({
        mnemonic: process.env.BLZ_MNEMONIC,
        uuid: Date.now().toString(),
        endpoint: process.env.BLZ_ENDPOINT,
        chain_id: process.env.BLZ_CHAIN_ID
    })

    googleTrends.realTimeTrends({
        geo: 'US'
    }).then(res => {

        JSON.parse(res).storySummaries.trendingStories.map(story => {

            story.entityNames.map(async entity => {

                osmosis
                    .get('https://duckduckgo.com/html/' + qs.stringify({ q: entity }, true))
                    // .click('[data-value="-2"]')
                    .find('.result__body')
                    .set({
                        snippets: '.result__snippet',
                        tempLink: '.result__url',
                        title: '.result__title',
                    }).data(async function (d) {
                        let speech = {
                            tempLink: d.tempLink,
                            text: d.snippets,
                            title: d.title,
                            censorability: 0
                        }
                        const analysis = await perspective.getScores(speech.text);
                        // Sleep for 1 sec, so that Google's perspective API is not overheated
                        await new Promise(r => setTimeout(r, 1000));
                        const censorability = (((analysis.TOXICITY - analysis.SPAM) + 1) / 2.0).toFixed(2);
                        if (censorability > CENSORABILITY_THRESHOLD) {
                            speech.censorability = censorability;
                            speech = JSON.stringify(speech);
                            const id = new Hashes.SHA256().hex(speech);
                            try {
                                let res = await blz.create(id, speech, {'gas_price': 10});
                                successPrint(res);
                                res = await blz.read(id);
                                successPrint(JSON.parse(res));
                            } catch (e) {
                                console.error(e.message);
                            };
                        }
                    }).error(console.error)
                    .log(console.log)
                    .debug(console.debug);
            })
        })
    }).catch(e => {
        console.error(e.message);
    });
}

main();

function successPrint(res) {
    console.log(typeof res != 'undefined' ? res : 'success');
}