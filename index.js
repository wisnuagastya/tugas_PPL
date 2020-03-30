'use strict';
let express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    request = require('request'),
    config = require('config'),
    images = require('./pics');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let users = {};

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

app.get('/', (req, res) => res.status(200).json('Hello Aga!'));

const token = "EAAMylxgroisBAKJkmHYGvWUpPeeUZBVWqkd7OGT7dcC4nJ3ZAEHhZBZBuWx6GiiDByZA7u3T8dgklZCIqaN4PdhQRuCZC83pqzKZBota7PANs0tyIwxN5Tt82FbDEZBGQWwtRfyl7DhjUEY5rWXin0i2rCt2hIg8kyzy6KmsbtEzIyLYDhQJTN9pQ"

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "hantuJoki123";

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403).send("WRONG TOKEN");;
        }
    }
});

// Creates the endpoint for our webhook
app.post('/webhook', (req, res) => {
    try {
        let body = req.body;

        // Checks this is an event from a page subscription
        if (body.object === 'page') {

            console.log(body.entry);

            // Iterates over each entry - there may be multiple if batched
            body.entry.forEach(function (entry) {
                // console.log(entry);
                // Gets the message. entry.messaging is an array, but
                // will only ever contain one message, so we get index 0
                let webhook_event = entry.messaging[0];
                // console.log("======== message =========")
                // console.log(webhook_event);

                for (let i = 0; i < entry.messaging.length; i++) {
                    console.log("index ke + " + i);
                    console.log(entry.messaging[i]);
                    sendText(entry.messaging[i].id, entry.messaging[i].text);
                }

            });

            // Returns a '200 OK' response to all requests
            return res.status(200).send('EVENT_RECEIVED');
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json(error.message);
    }

});

function sendText(sender, text) {
    request({
        "url": "https://graph.facebook.com/v6.0/me/messages",
        "qs": { "access_token": token },
        "method": "POST",
        "json": {
            "messaging_type": "RESPONSE",
            "recipient": {
                "id": sender
            },
            "message": {
                "text": text
            }
        }
    })
}