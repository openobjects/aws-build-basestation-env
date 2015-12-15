var AWS = require("aws-sdk");

exports.handler = function(region) {
        var apigateway = new AWS.APIGateway({ region: region });
        
apigateway.createRestApi({ name: "LambdaMicroservice" }, function(err, apiData) {
  if (err) console.log(err, err.stack); // an error occurred
  else {
       console.log(apiData);           // successful response
       
       apigateway.getResources({ restApiId: apiData.id }, function(err, resourcesData) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
             console.log(resourcesData);           // successful response
             
             var baseResource = resourcesData.items[0];
             
             var resourceParams = {
                 restApiId: apiData.id,
                 parentId: baseResource.id,
                 pathPart: "callFunction"
             };
             
             apigateway.createResource(resourceParams, function(err, resourceData) {
                if (err) console.log(err, err.stack); // an error occurred
                else {
                    console.log(resourceData);           // successful response
                    
                    var methodParams = {
                    authorizationType: 'AWS_IAM', // required 
                    httpMethod: 'POST', // required
                    resourceId: resourceData.id, // required 
                    restApiId: apiData.id, // required
                    apiKeyRequired: false
                    };
                    apigateway.putMethod(methodParams, function(err, methodData) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else     {
                        console.log(methodData);           // successful response
                        
                        apigateway.putMethodResponse({
                            httpMethod: 'POST', // required
                            resourceId: resourceData.id, // required 
                            restApiId: apiData.id, // required
                            "responseModels": {},
                            "statusCode": "200"
                        }, function(err, methodResponseData) {
                        if (err) console.log(err, err.stack); // an error occurred
                        else {
                             console.log(methodResponseData);           // successful response
                             
                             var integrationParams = {
                                httpMethod: 'POST', // required
                                type: "AWS",
                                uri: "arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-1:824411538776:function:callFunction/invocations",
                                resourceId: resourceData.id, // required 
                                restApiId: apiData.id, // required
                                integrationHttpMethod: 'POST',
                                credentials: 'arn:aws:iam::824411538776:role/apiGatewayLambdaInvokeRole'
                                };
                                apigateway.putIntegration(integrationParams, function(err, integrationData) {
                                if (err) {
                                console.log(err, err.stack); // an error occurred
                                
                                apigateway.deleteRestApi({ restApiId: apiData.id }, function(err, data) {
                                    if (err) console.log(err, err.stack); // an error occurred
                                    else     console.log(data);           // successful response
                                    });
                                }
                                else {
                                    console.log(integrationData);           // successful response
                                    
                                    apigateway.putIntegrationResponse({
                                        httpMethod: 'POST', // required
                                        resourceId: resourceData.id, // required 
                                        restApiId: apiData.id, // required
                                        "selectionPattern": ".*",
                                        "statusCode": "200"
                                    }, function(err, integrationResponseData) {
                                    if (err) console.log(err, err.stack); // an error occurred
                                    else     console.log(integrationResponseData);           // successful response
                                    });
                                }
                                });
                        }
                        });
                    }
                    });
                    
                    // ,
                    // "methodIntegration": {
                    //     "integrationResponses": {
                    //         "200": {
                    //             "selectionPattern": ".*",
                    //             "statusCode": "200"
                    //         }
                    //     },
                    //     "cacheKeyParameters": [],
                    //     "uri": "arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-1:824411538776:function:callFunction/invocations",
                    //     "httpMethod": "POST",
                    //     "type": "AWS"
                    // }
                }
                });
        }
        });
  }
});
};