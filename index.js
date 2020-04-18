const { Client } = require('@conversationai/perspectiveapi-js-client');
var osmosis = require('osmosis');
const { bluzelle } = require('./blzjs/src/main.js');
const Hashes = require('jshashes');

require('dotenv').config();

const perspective = new Client(process.env.PERSPECTIVE_API_KEY);

const config = require('./blz-config.js');

const main = async () => {

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

    // add scrapper

    const text = "something inflamatory";

    const analysis = await perspective.getScores(text);

    const speech = JSON.stringify({
        author: "somebody",
        text: text,
        platform: "Twitter",
        tempLink: "url/path/to/text",
        date: "03/20/2020",
        censorability: ((analysis.TOXICITY - analysis.SPAM) + 1) / 2.0
    })

    const id = new Hashes.SHA256().hex(speech);

    try {
        let res = await blz.create(id, speech, config.gas_params);
        successPrint(res);
        res = await blz.read(id);
        successPrint(JSON.parse(res));
    } catch(e) {
        console.error(e.message);
    };
}

main();

function successPrint(res) {
    console.log(typeof res != 'undefined' ? res : "success");
}