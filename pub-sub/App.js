const express = require('express');
const cors = require('cors');
const { PubSub } = require('@google-cloud/pubsub');
const App = express();
App.use(cors());
App.use(express.json());

const topicName = 'test';
const subscriptionName = 'test_subscription';

const pubSubClient = new PubSub({
    projectId: 'csci5410-safe-deposit',
    keyFilename: './csci5410-safe-deposit-c8ee7d8284ca.json'
});

App.put('/publish', (req, res) => {
    try {
        var body = req.body;
        var senderId = body['senderId'];
        var recipientId = body['recipientId'];
        var boxId = body['boxId'];
        var message = body['message'];
        const data = JSON.stringify({ senderId: senderId, recipientId: recipientId, boxId: boxId, message: message });

        publishMessage(data).then(value => {
            return res.status(200).json({
                success: true,
                message: "Published message"
            });
        });
    } catch (ex) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
})

async function createTopic() {
    await pubSubClient.createTopic(topicName);
    console.log(`Topic ${topicName} created.`);
}

async function publishMessage(data) {
    const dataBuffer = Buffer.from(data);

    try {
        const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
        console.log(`Message ${messageId} published.`);
    } catch (error) {
        console.error(`Received error while publishing: ${error.message}`);
        process.exitCode = 1;
    }
}

async function createSubscription() {
    await pubSubClient.topic(topicName).createSubscription(subscriptionName);
    console.log(`Subscription ${subscriptionName} created.`);
  }

async function createPushSubscription() {
    const options = {
        pushConfig: {
            pushEndpoint: `https://dynamo-docker-h7l5abthoq-uc.a.run.app/notify`,
        },
    };

    await pubSubClient
        .topic(topicName)
        .createSubscription(subscriptionName, options);
    console.log(`Subscription ${subscriptionName} created.`);
}

//createTopic();
//createPushSubscription().catch(console.error);
//createSubscription().catch(console.error);
//publishMessage();

module.exports = App;