var AWS = require("aws-sdk");
var fs = require('fs');

exports.handler = function(region) {
var iot = new AWS.Iot({ region: region });

 if(!fs.existsSync("certs")){
     fs.mkdirSync("certs", 0766, function(err){
       if(err){ 
         console.log(err);
         response.send("ERROR! Can't make the directory! \n");    // echo the result back
       }
     });   
 }

var things = [
  {
        "attributePayload": {},
        "thingName": "raspberry"
    },
    {
        "attributePayload": {},
        "thingName": "service"
    } 
];

things.forEach(function(params) {
    console.log(params);
    iot.createThing(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
     });
}, this);

var policyParams = {
    "policyName": "raspberry-Policy",
    "policyDocument": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Action\":[\"iot:*\"],\"Resource\":[\"*\"],\"Effect\":\"Allow\"}]}"
};

iot.createPolicy(policyParams, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});

iot.createKeysAndCertificate({
        setAsActive: true || false
    }, function(err, certificateData) {
  if (err) console.log(err, err.stack); // an error occurred
  else {
      console.log(certificateData);           // successful response
      
      fs.writeFile('certs/certificate.pem.crt', certificateData.certificatePem, function (err) {
            if (err) 
                return console.log(err);
            console.log('certs/certificate.pem.crt');
        });
        
      fs.writeFile('certs/private.pem.key', certificateData.keyPair.PrivateKey, function (err) {
            if (err) 
                return console.log(err);
            console.log('certs/private.pem.key');
        });
      
      things.forEach(function(thingParams) {
            iot.attachThingPrincipal({
                principal: certificateData.certificateArn,
                thingName: thingParams.thingName
            }, function(err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else     console.log(data);           // successful response
            });
        }, this);
        
        iot.attachPrincipalPolicy({
            policyName: policyParams.policyName,
            principal: certificateData.certificateArn
        }, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
        });
  }
});

var topicRuleParams = {
        topicRulePayload: {
            "sql": "SELECT * FROM '#'",
            "ruleDisabled": false,
            "actions": [
                {
                    "sns": {
                        "targetArn": "arn:aws:sns:eu-west-1:824411538776:callTopic",
                        "roleArn": "arn:aws:iam::824411538776:role/iot-actions-role"
                    }
                }
            ]
        },
        "ruleName": "callSNSTopicRule"
    };
iot.createTopicRule(topicRuleParams, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
};