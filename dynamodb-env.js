var AWS = require("aws-sdk");

exports.handler = function(region) {
var dynamodb = new AWS.DynamoDB({ region: region });

var tableParams = {
        "AttributeDefinitions": [
            {
                "AttributeName": "key",
                "AttributeType": "S"
            },
            {
                "AttributeName": "timestamp",
                "AttributeType": "S"
            }
        ],
        "ProvisionedThroughput": {
            "WriteCapacityUnits": 5,
            "ReadCapacityUnits": 5
        },
        "TableName": "callQueue",
        "KeySchema": [
            {
                "KeyType": "HASH",
                "AttributeName": "key"
            },
            {
                "KeyType": "RANGE",
                "AttributeName": "timestamp"
            }
        ]
    };

dynamodb.createTable(tableParams, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
};