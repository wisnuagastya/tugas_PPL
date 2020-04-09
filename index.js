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

// const token = "EAAMylxgroisBAKJkmHYGvWUpPeeUZBVWqkd7OGT7dcC4nJ3ZAEHhZBZBuWx6GiiDByZA7u3T8dgklZCIqaN4PdhQRuCZC83pqzKZBota7PANs0tyIwxN5Tt82FbDEZBGQWwtRfyl7DhjUEY5rWXin0i2rCt2hIg8kyzy6KmsbtEzIyLYDhQJTN9pQ"

const token = "EAAKB2msc6dgBAJcLcWeszyxRD3KQZBdhW0NDvZAQrQzFCSylXZCZBUmbqSsbCABQZB6jxQpijt4BPKvlZCniSZB7PdEqjKaokGQjXAbgOcZBpUDNB6hpLtO7P7QBKWf2sOVK887R7vALfZCuMDt8ZBF13GmhpZAv4J6ELQpBMc6SDpP4gZDZD"

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

const axios = require('axios');

// Creates the endpoint for our webhook
app.post('/webhook', async (req, res) => {
    try {
        let body = req.body;

        // Checks this is an event from a page subscription
        if (body.object === 'page') {
            // Iterates over each entry - there may be multiple if batched
            body.entry.forEach(function (entry) {
                for (let i = 0; i < entry.messaging.length; i++) {
                    console.log("index ke + " + i);
                    console.log(entry.messaging[i]);

                    const data = {
                        accessToken: token,
                        recipient_id: entry.messaging[i].sender.id,
                        message: entry.messaging[i].text
                    }

                    await(axios.post(`${process.env.FB_HOST}/me/messages?access_token=${data.accessToken}`, {
                        data: {
                            messaging_type: "RESPONSE",
                            recipient: {
                                id: data.recipient_id
                            },
                            message: {
                                text: data.message
                            }
                        }
                    })).data;
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

const sendMessage = async (data) => {
    try {
        const send = (await axios.post(`${process.env.FB_HOST}/me/messages?access_token=${data.accessToken}`, {
            data: {
                messaging_type: "RESPONSE",
                recipient: {
                    id: data.recipient_id
                },
                message: {
                    text: data.message
                }
            }
        })).data;

        console.log(send)
        return Promise.resolve({ success: true, data: send });
    }
    catch (err) {
        console.log(err.message)
        return Promise.reject({ success: false })
    }
}
