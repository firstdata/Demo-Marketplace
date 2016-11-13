# Marketplace-Demo
A sample Marketplace App using the First Data Marketplace APIs

## What is Marketplace-Demo?
The Marketplace-Demo is an e-commerce site that uses FirstData's Marketplace APIs (in a sandbox environment).  Marketplace-Demo is written using express and angular.

## How do I get started?
You can visit [fdmarketplacedemo.com](http://fdmarketplacedemo.com) to see a live demo, or you can clone this repo and install the dependencies via the following commands:

### Update configuration file

Update config/default.json file. Use credentials received from the https://developer.firstdata.com site:
```
{
  "kong": {
    "url": "API_URL",
    "username": "API_USERNAME",
    "secret": "API_SECRET"
  },
  "port": 3000
}
```

Then run:

```
npm install
npm start
```

Now you can visit localhost:3000 to view the site.

If you need to make changes into any of JavaScript files, make all changes and then run: 

```
grunt deploy
```

This will concatenate all your changes into the fd.js file.

More information you can find on [developer.firstdata.com/docs/](https://docs.developer.firstdata.com/marketplace/)

## Deploy to Heroku
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/firstdata/Demo-Marketplace/tree/master)
