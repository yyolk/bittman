'use strict';

const AWS = require('aws-sdk');
const CalculateVolatility = require('./calculateVolatility');
const $db = new AWS.DynamoDB();
const DynamoDB = require('aws-dynamodb')($db);
const table = process.env.DYNAMODB_TABLE;

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.calculate = (event, context, callback) => {
    const calculateVolatility = new CalculateVolatility();
    calculateVolatility.calculateStdDev()
        .then(data => {
            const deleteParams = {
                TableName: table,
                Key: { id: 'stdDev' }
            }
            dynamoDb.delete(deleteParams, (err, result) => {
                if (err) {
                    callback(err);
                    return;
                }
                const insertData = Object.assign(data, { id: 'stdDev' });
                console.log(insertData);
                dynamoDb.put({ TableName: table, Item: insertData }, (err, result) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    const response = {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: 'Successfully updated DynamoDB with std dev values',
                            input: event,
                        }),
                    };
                    callback(null, response);
                });
            });
        })
        .catch(callback)
};