var iotEnv = require('./iot-env');
var dynamodbEnv = require('./dynamodb-env');
var apigatewayEnv = require('./apigateway-env');

var region = "eu-west-1";

iotEnv.handler(region);
dynamodbEnv.handler(region);
apigatewayEnv.handler(region);