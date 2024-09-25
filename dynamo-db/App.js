const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const App = express();
App.use(cors());
App.use(express.json());

AWS.config.loadFromPath('./config.json');
var docClient = new AWS.DynamoDB.DocumentClient();

// POST API for notifying users
App.post('/notify', (req, res) => {
    try {
        const req_body = Buffer.from(req.body.message.data, 'base64').toString(
            'utf-8'
        );
        var body = JSON.parse(req_body);
        var senderId = body['senderId'];
        var recipientId = body['recipientId'];
        var boxId = body['boxId'];
        var message = body['message'];

        var new_message = {
            message: message,
            senderId: senderId,
            boxId: boxId,
            read: false,
            timestamp: Date.now()
        }

        var params = {
            TableName: 'users',
            Key: { 'userId': recipientId },
            ReturnValues: 'ALL_NEW',
            UpdateExpression: 'set #messages = list_append(if_not_exists(#messages, :empty_list), :message)',
            ExpressionAttributeNames: {
                '#messages': 'messages'
            },
            ExpressionAttributeValues: {
                ':message': [new_message],
                ':empty_list': []
            }
        };

        docClient.update(params, function (err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return res.status(400).json({
                    success: true,
                    message: "User not found"
                });
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                return res.status(200).json({
                    success: true,
                    message: "Notified users"
                });
            }
        });        
    }
    catch (ex) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

function generateId() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 5; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

App.post('/registernewbox', (req, res) => {
    try {
        var body = req.body;
        var userId = body['userId'];
        var table = 'boxes';

        var boxId = generateId();
        var params = {
            TableName: table,
            Item: {
                "boxId": boxId,
                "balance": 5000,
                "userIds": [userId]
            }
        };

        docClient.put(params, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                return res.status(400).json({
                    success: false,
                    message: "Failed to create deposit box"
                });
            } else {
                console.log("Added item:", JSON.stringify(data, null, 2));
                
                table = 'users';
                params = {
                    TableName: table,
                    Key: { 'userId': userId },
                    ReturnValues: 'ALL_NEW',
                    UpdateExpression: 'set boxes = list_append(if_not_exists(boxes, :empty_list), :boxId)',
                    ExpressionAttributeValues: {
                        ':boxId': [boxId],
                        ':empty_list': []
                    }
                };
        
                docClient.update(params, function (err, data) {
                    if (err) {
                        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                        return res.status(400).json({
                            success: false,
                            message: "Unable to add box id to user"
                        });
                    } else {
                        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                        return res.status(200).json({
                            success: true,
                            data: boxId,
                            message: "Created deposit box"
                        });
                    }
                });
            }
        });
    }
    catch (ex) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

App.put('/registerexistingbox', (req, res) => {
    try {
        var body = req.body;
        var userId = body['userId'];
        var boxId = body['boxId'];
        var table = 'boxes';

        var params = {
            TableName: table,
            Key: { 'boxId': boxId },
            ReturnValues: 'ALL_NEW',
            UpdateExpression: 'set userIds = list_append(if_not_exists(userIds, :empty_list), :userId)',
            ExpressionAttributeValues: {
                ':userId': [userId],
                ':empty_list': []
            }
        };

        docClient.update(params, function (err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return res.status(400).json({
                    success: false,
                    message: "Unable to add user to deposit box"
                });
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                
                table = 'users';
                params = {
                    TableName: table,
                    Key: { 'userId': userId },
                    ReturnValues: 'ALL_NEW',
                    UpdateExpression: 'set boxes = list_append(if_not_exists(boxes, :empty_list), :boxId)',
                    ExpressionAttributeValues: {
                        ':boxId': [boxId],
                        ':empty_list': []
                    }
                };
        
                docClient.update(params, function (err, data) {
                    if (err) {
                        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                        return res.status(400).json({
                            success: false,
                            message: "Unable to add deposit box to user"
                        });
                    } else {
                        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                        return res.status(200).json({
                            success: true,
                            message: "Added deposit box to user"
                        });
                    }
                });
            }
        });
    }
    catch (ex) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

App.get('/getuserdepositboxes/:userId', (req, res) => {
    try {
        var userId = req.params.userId;
        var table = 'users';

        var params = {
            TableName: table,
            Key: { 'userId': userId }
        }

        docClient.get(params, function (err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return res.status(400).json({
                    success: false,
                    message: "Deposit boxes not found"
                });
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                return res.status(200).json({
                    success: true,
                    message: "Deposit boxes found",
                    data: data.Item.boxes
                });
            }
        });
    }
    catch (ex) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

App.get('/getdepositboxusers/:boxId', (req, res) => {
    try {
        var boxId = req.params.boxId;
        var table = 'boxes';

        var params = {
            TableName: table,
            Key: { 'boxId': boxId }
        }

        docClient.get(params, function (err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return res.status(400).json({
                    success: false,
                    message: "Users not found"
                });
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                return res.status(200).json({
                    success: true,
                    message: "Users found",
                    data: data.Item ? data.Item.userIds : undefined
                });
            }
        });
    }
    catch (ex) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

App.get('/getdepositboxbalance/:boxId', (req, res) => {
    try {
        var boxId = req.params.boxId;
        var table = 'boxes';

        var params = {
            TableName: table,
            Key: { 'boxId': boxId }
        }

        docClient.get(params, function (err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return res.status(400).json({
                    success: false,
                    message: "Deposit box not found"
                });
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                return res.status(200).json({
                    success: true,
                    message: "Deposit box found",
                    data: data.Item.balance
                });
            }
        });
    }
    catch (ex) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

App.get('/getuserpassword/:userId', (req, res) => {
    try {
        var userId = req.params.userId;
        var table = 'users';

        var params = {
            TableName: table,
            Key: { 'userId': userId }
        }

        docClient.get(params, function (err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return res.status(400).json({
                    success: false,
                    message: "User not found"
                });
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                return res.status(200).json({
                    success: true,
                    message: "User found",
                    data: data.Item ? data.Item.password : undefined
                });
            }
        });
    }
    catch (ex) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

App.get('/getsecurity/:userId', (req, res) => {
    try {
        var userId = req.params.userId;
        var table = 'users';

        var params = {
            TableName: table,
            Key: { 'userId': userId }
        }

        docClient.get(params, function (err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return res.status(400).json({
                    success: false,
                    message: "Security question not found"
                });
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                return res.status(200).json({
                    success: true,
                    message: "Security question found",
                    data: data.Item ? data.Item.security : undefined
                });
            }
        });
    }
    catch (ex) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

App.get('/getshiftkey/:userId', (req, res) => {
    try {
        var userId = req.params.userId;
        var table = 'users';

        var params = {
            TableName: table,
            Key: { 'userId': userId }
        }

        docClient.get(params, function (err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return res.status(400).json({
                    success: false,
                    message: "Shift key not found"
                });
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                return res.status(200).json({
                    success: true,
                    message: "Shift key found",
                    data: data.Item ? data.Item.shiftkey : undefined
                });
            }
        });
    }
    catch (ex) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

App.get('/messages/:userId', (req, res) => {
    try {
        var userId = req.params.userId;
        var table = 'users';

        var params = {
            TableName: table,
            Key: { 'userId': userId }
        }

        docClient.get(params, function (err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return res.status(400).json({
                    success: false,
                    message: "Messages not found"
                });
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                return res.status(200).json({
                    success: true,
                    message: "Messages found",
                    data: data.Item.messages
                });
            }
        });
    }
    catch (ex) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

App.put('/withdraw', (req, res) => {
    try {
        var body = req.body;
        var userId = body['userId'];
        var boxId = body['boxId'];
        var amount = body['amount'];
        var table = 'boxes';

        var params = {
            TableName: table,
            Key: { "boxId": boxId },
            UpdateExpression: "set balance = balance - :val",
            ExpressionAttributeValues: {
                ":val": amount
            },
            ReturnValues: "UPDATED_NEW"
        };

        docClient.update(params, function (err, data) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                return res.status(400).json({
                    success: false,
                    message: "Could not update balance"
                });
            } else {
                console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));

                var balance = data.Attributes.balance;
                var transaction = {
                    boxId: boxId,
                    amount: amount,
                    balance: balance,
                    timestamp: Date.now()
                };
                table = 'users';
                params = {
                    TableName: table,
                    Key: { 'userId': userId },
                    ReturnValues: 'ALL_NEW',
                    UpdateExpression: 'set #transactions = list_append(if_not_exists(#transactions, :empty_list), :transaction)',
                    ExpressionAttributeNames: {
                        '#transactions': 'transactions'
                    },
                    ExpressionAttributeValues: {
                        ':transaction': [transaction],
                        ':empty_list': []
                    }
                };

                docClient.update(params, function (err, data) {
                    if (err) {
                        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                        return res.status(400).json({
                            success: false,
                            message: "Could not update transaction"
                        });
                    } else {
                        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                        return res.status(200).json({
                            success: true,
                            message: "Updated transaction"
                        });
                    }
                });
            }
        });
    }
    catch (ex) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

app.post("/Signup", async (req, res) => {
  
    const email = req.body.email;
    const password = req.body.password;
   console.log(password+"1");
    const perameters = {
    TableName: "userData",
    Item: {
      email: email,
      password: password
    },
  };
  
  dynamoClient.put(perameters, function(err, data) {
    if (err) {
        console.error(err);
    } else {
        console.log("PutItem succeeded:"+password);
        console.log(password+email);
        res.send({
          headers: {
            "Access-Control-Allow-Origin" : "*",
            "Access-Control-Allow-Credentials" : true 
        },
          message: "registered"
        });
    }
  });
  });


module.exports = App;