# blunzens-scrap
Uncensorable speech spider on BluzelleDB.

## Note

This is a test, do not (yet) follow the below instructions.

## Configuration

Run `npm run prep`.

Copy `.env.example` to `.env` and add your keys.
You must have a Google Perspective API key. To get one, visit https://www.perspectiveapi.com/#/home.

Copy `./blzjs/samples/blz-config.js.sample` to `blz-config.js` and add your Bluzelle credentials.
You must have a Bluzelle testnet account. For more info, visit https://docs.bluzelle.com/developers/bluzelle-db/getting-started-with-testnet.

Run `npm install`.

## Usage

You should take advatnage of the comfortable umbrella of a VPN. Our suggestion is ProtonVPN. After sign-up and installation, don't forget to run:
```
sudo protonvpn c
```
before each run of the following instruction:
```
npm start
```
The spider should be running now. Let it crawl for a while, until it stops.
You can run `npm start` any time you wish to update the BluzelleDB.




