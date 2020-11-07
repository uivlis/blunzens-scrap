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

function successPrint(res) {
    console.log(res ? res : 'success');
}

function scrapEntities() {
    return new Promise((resolve) => {
        let results = [];
        googleTrends.realTimeTrends({
            geo: 'US'
        }).then(res => {
            JSON.parse(res).storySummaries.trendingStories.map(story => {
                results.push(story.entityNames);
            });
            resolve(results.flat());
        });
    });
}

function scrapeSpeech(entity) {
    return new Promise((resolve) => {
      let results = [];
      osmosis
        .get('https://duckduckgo.com/html/' + qs.stringify({ q: entity }, true))
        // .click('[data-value="-2"]')
        .find('.result__body')
        .set({
            text: '.result__snippet',
            tempLink: '.result__url',
            title: '.result__title',
        }).data(speech => {
            speech["censorability"] = 0;
            results.push(speech)
        }).error(console.error)
        .log(console.log)
        .debug(console.debug)
        .done(() => {
            resolve(results);
        })
    });
}

async function analyzeSpeech(speech) {
    let errored = false;
    let analysis;
    do {
        try {
            analysis = await perspective.getScores(speech.text);
            errored = false;
        } catch (e) {
            errored = true;
            console.error(e.message, "Retrying to fetch scores...");
        }
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 250))
    } while(errored);
    return analysis;
}

const main = async () => {

    let blz = bluzelle({
        mnemonic: process.env.BLZ_MNEMONIC,
        uuid: "Blunzens",
        endpoint: process.env.BLZ_ENDPOINT,
        chain_id: process.env.BLZ_CHAIN_ID
    })

    let entities = await scrapEntities();

    let speeches = (await Promise.all(await new Promise(resolve => {
        let speeches = [];
        entities.map(async entity => {
            speeches.push(scrapeSpeech(entity));
        })
        resolve(speeches);
    }))).flat();

    for (i in speeches) {
        let speech = speeches[i];
        let analysis = await analyzeSpeech(speech);
        const censorability = (((analysis.TOXICITY - analysis.SPAM) + 1) / 2.0).toFixed(2);
        if (censorability > CENSORABILITY_THRESHOLD) {
            speech.censorability = censorability;
            blzSpeech = JSON.stringify(speech);
            const id = new Hashes.SHA256().hex(blzSpeech);
            let res;
            try {
                res = await blz.create(id, blzSpeech, {'gas_price': 10, 'max_gas': 7000000});
                successPrint(res);
                res = await blz.read(id);
                successPrint(JSON.parse(res));
            } catch (e) {
                console.error(e);
            }
        }
    }
}

main();
