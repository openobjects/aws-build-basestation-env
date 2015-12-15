var AWS = require("aws-sdk");
var Q = require("q");

exports.handler = function(region, callback) {
var iot = new AWS.Iot({ region: region });

var allDoneDeferred = Q.defer();

if (callback) {
  Q.all([allDoneDeferred.promise]).then(callback);
}

var listCertificatesDeferred = Q.defer();

iot.listCertificates({}, function(err, certificatesData) {
  if (err) console.log(err, err.stack); // an error occurred
  else {
      console.log(certificatesData);           // successful response
      
      var listCertificatesDeferredPromises = [];
      var certificatesPromises = certificatesData.certificates.map(function(certificateData) {
          var deferred = Q.defer();
          listCertificatesDeferredPromises.push(deferred.promise);
        return { deferred: deferred, certificateData: certificateData };
      });
      
      Q.all(listCertificatesDeferredPromises).then(function() {
              listCertificatesDeferred.resolve(null);
            });
      
      certificatesPromises.forEach(function(certificatePromise) {
          var certificateData = certificatePromise.certificateData;
          
            // iot.createThing(params, function(err, data) {
            //     if (err) console.log(err, err.stack); // an error occurred
            //     else     console.log(data);           // successful response
            // });
            
            var principalThingsDeferred = Q.defer();
            var principalPoliciesDeferred = Q.defer();
            Q.all([principalThingsDeferred.promise, principalPoliciesDeferred.promise]).then(function() {
                iot.updateCertificate({
                  certificateId: certificateData.certificateId,
                  newStatus: 'REVOKED'
                }, function(err, updateCertificateData) {
                  if (err) console.log(err, err.stack); // an error occurred
                  else {
                        console.log(updateCertificateData);           // successful response
                        
                        iot.deleteCertificate({ certificateId: certificateData.certificateId },
                          function(err, deleteCertificateData) {
                          if (err) console.log(err, err.stack); // an error occurred
                          else {
                              console.log(deleteCertificateData);           // successful response
                              
                              certificatePromise.deferred.resolve(null);
                          }
                        });
                  }
                });
            });
            
            iot.listPrincipalThings({ principal: certificateData.certificateArn }, function(err, principalThingsData) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                console.log(principalThingsData);           // successful response
                
                var listPrincipalThingsDeferredPromises = [];
                var listPrincipalThingsPromises = principalThingsData.things.map(function(thingName) {
                    var deferred = Q.defer();
                    listPrincipalThingsDeferredPromises.push(deferred.promise);
                  return { deferred: deferred, thingName: thingName };
                });
                
                Q.all(listPrincipalThingsDeferredPromises).then(function() {
                        principalThingsDeferred.resolve(null);
                      });
                
                listPrincipalThingsPromises.forEach(function(listPrincipalThingsPromise) {
                    var thingName = listPrincipalThingsPromise.thingName;
                    console.log(thingName);
                    
                    iot.detachThingPrincipal({
                        principal: certificateData.certificateArn,
                        thingName: thingName
                        }, function(err, detachThingPrincipalData) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else {
                         console.log(detachThingPrincipalData);           // successful response
                         
                         listPrincipalThingsPromise.deferred.resolve(null);
                    }
                    });
                });
            }
            });
            
            iot.listPrincipalPolicies({ principal: certificateData.certificateArn }, function(err, principalPoliciesData) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                console.log(principalPoliciesData);           // successful response
                
                var listPrincipalPoliciesDeferredPromises = [];
                var listPrincipalPoliciesPromises = principalPoliciesData.policies.map(function(policyData) {
                    var deferred = Q.defer();
                    listPrincipalPoliciesDeferredPromises.push(deferred.promise);
                  return { deferred: deferred, policyData: policyData };
                });
                
                Q.all(listPrincipalPoliciesDeferredPromises).then(function() {
                        principalPoliciesDeferred.resolve(null);
                      });
                
                listPrincipalPoliciesPromises.forEach(function(listPrincipalPoliciesPromise) {
                    var policyData = listPrincipalPoliciesPromise.policyData;
                    console.log(policyData);
                    
                    iot.detachPrincipalPolicy({
                        principal: certificateData.certificateArn,
                        policyName: policyData.policyName
                        }, function(err, detachPrincipalPolicyData) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else {
                        console.log(detachPrincipalPolicyData);           // successful response
                        
                        listPrincipalPoliciesPromise.deferred.resolve(null);
                    }
                    });
                });
            }
            });
        }, this);
  }
});

    Q.all([listCertificatesDeferred.promise]).then(function() {
      var listThingsDeferred = Q.defer();
      var listPoliciesDeferred = Q.defer();
      var listTopicRulesDeferred = Q.defer();
      
      Q.all([listThingsDeferred.promise, listPoliciesDeferred.promise, listTopicRulesDeferred.promise]).then(function() {
        allDoneDeferred.resolve(null);
      });
      
      iot.listThings({}, function(err, thingsData) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            console.log(thingsData);           // successful response
            
            var listThingsDeferredPromises = [];
            var thingsPromises = thingsData.things.map(function(thingData) {
                var deferred = Q.defer();
                listThingsDeferredPromises.push(deferred.promise);
              return { deferred: deferred, thingData: thingData };
            });
            
            Q.all(listThingsDeferredPromises).then(function() {
                    listThingsDeferred.resolve(null);
                  });
            
            thingsPromises.forEach(function(thingsPromise) {
                  var thingData = thingsPromise.thingData;
                  
                  iot.deleteThing({ thingName: thingData.thingName }, function(err, data) {
                      if (err) console.log(err, err.stack); // an error occurred
                      else {
                        console.log(data);           // successful response
                        
                        thingsPromise.deferred.resolve(null);
                      }
                  });
              }, this);
        }
      });
      
      
      
      
      iot.listPolicies({}, function(err, policiesData) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            console.log(policiesData);           // successful response
            
            var listPoliciesDeferredPromises = [];
            var policiesPromises = policiesData.policies.map(function(policyData) {
                var deferred = Q.defer();
                listPoliciesDeferredPromises.push(deferred.promise);
              return { deferred: deferred, policyData: policyData };
            });
            
            Q.all(listPoliciesDeferredPromises).then(function() {
                    listPoliciesDeferred.resolve(null);
                  });
            
            policiesPromises.forEach(function(policiesPromise) {
                  var policyData = policiesPromise.policyData;
                  
                  iot.deletePolicy({ policyName: policyData.policyName }, function(err, data) {
                      if (err) console.log(err, err.stack); // an error occurred
                      else {
                        console.log(data);           // successful response
                        
                        policiesPromise.deferred.resolve(null);
                      }
                  });
              }, this);
        }
      });
      
      
      iot.listTopicRules({}, function(err, rulesData) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            console.log(rulesData);           // successful response
            
            var listRulesDeferredPromises = [];
            var rulesPromises = rulesData.rules.map(function(ruleData) {
                var deferred = Q.defer();
                listRulesDeferredPromises.push(deferred.promise);
              return { deferred: deferred, ruleData: ruleData };
            });
            
            Q.all(listRulesDeferredPromises).then(function() {
                    listTopicRulesDeferred.resolve(null);
                  });
            
            rulesPromises.forEach(function(rulesPromise) {
                  var ruleData = rulesPromise.ruleData;
                  
                  iot.deleteTopicRule({ ruleName: ruleData.ruleName }, function(err, data) {
                      if (err) console.log(err, err.stack); // an error occurred
                      else {
                        console.log(data);           // successful response
                        
                        rulesPromise.deferred.resolve(null);
                      }
                  });
              }, this);
        }
      });
    });
};