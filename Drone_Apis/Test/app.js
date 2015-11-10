'use strict';

var workflow_api_lib = require('workflow-api-lib'),
                express = require('express'),
                app = express();

var mongoose =  require('mongoose');
var mappingData = null;
mongoose.connect('mongodb://localhost:27017/cad');

var mappingSchema = new mongoose.Schema({
            mappingdetails:{
                sonarmapping:[
                    {
                       "ECX":[]
                     },
                     {
                        "ECP":[]
                     },
                     {
                        "MKP":[]
                     },
                     {
                        "FASE":[]
                     }
                   ]
                 }
               });

var map = mongoose.model('Mapping',mappingSchema,'CadCollection');
map.findById("563d4823076b2593e93ec975", function(err,doc){
    //console.log("doc " + JSON.stringify(doc));
     mappingData = JSON.stringify(doc.mappingdetails);
     console.log(mappingData);

});
//console.log(mappingData);

var data;

var sonar_rules = workflow_api_lib.createRule('/conf/rules/sonar_rules.json'),
                jenkins_rules = workflow_api_lib.createRule('/conf/rules/jenkins_rules.json'),
                jira_rules = workflow_api_lib.createRule('/conf/rules/jira_rules.json');

app.get('/apps', function (req, res) {
                sonar_rules.init({
                                    host: "codeanalysis.corp.equinix.com",
                                    port: 80,
                                    secure: false
                                }, 'get_metrics', { }, function(results) {
                                    //console.log(results.metrics.data[0].msr)
				jira_rules.init({
                                    host: "gsejira.corp.equinix.com",
                                    port: 80,
                                    secure: false
                    }, 'get_projects', { id: results.metrics.data[0].id}, function(results2) {
                                        //console.log("data " + results2.jiraprojects.data[0].name);
                                        data = res.json({codeanalysis:results, gsejira: results2});

                                      var coverage_ecp = results.metrics.data[0].msr[0];
                                       var coverage_marketplace= results.metrics.data[1].msr[0];
                                            var appsdetails={};
                                            var apps = [];
                                        
                                            console.log("coverage "  +appsdetails.coverage);
                                        apps.push({"appname":"ECP",
                                                  "applead":"ABC",
                                                  "apptitle":"Equinix Customer Portal",
                                                  "coverage":coverage_ecp

                                              },
                                              {"appname":"ECP",
                                               "apptitle":"Equinix Marketplace",
                                                  "applead":"XYJ",
                                                  "coverage":coverage_marketplace
                                              }
                                            
                                              );

                                        appsdetails.apps = apps;
                                        var obj = appsdetails.apps;


                                        var finalobj = {appdetails:{
                                            apps:obj}};
                                       // console.log("appjson " +JSON.stringify({appdetails:{
                                           // apps:obj}}));
                                        //res.json(finalobj);

                                        
                                       
                                       

                });
                                

                });
});


app.get('/repos', function (req, res) {
                sonar_rules.init({
                                                host: "codeanalysis.corp.equinix.com",
                                                port: 80,
                                                secure: false
                                }, 'get_repos', {  }, function(results) {
                                res.json(results);
                });
});


app.get('/combined', function (req, res) {
                sonar_rules.init({
                                        host: "codeanalysis.corp.equinix.com",
                                        port: 80,
                                        secure: false
                                }, 'get_combined', {  }, function(results) {
                                    console.log("HERE")
                               // res.json(results);

jira_rules.init({
                    host: "gsejira.corp.equinix.com",
                    port: 80,
                    secure: false
                    }, 'get_projects', {  
                                        id: results.metrics.data[0].id
                                    }, function(results2) {
                                        console.log("THERE")
                                       res.json({codeanalysis:results, gsejira: results2});

                });
            });
        });






app.get('/profiles',function(req,res) {
	               sonar_rules.init({
                                                host: "codeanalysis.corp.equinix.com",
                                                port: 80,
                                                secure: false
                                }, 'get_profiles', {}, function(results) {
                                res.json(results);
                });
});


app.get('/sonar',function(req,res) {
                       sonar_rules.init({
                                                host: "codeanalysis.corp.equinix.com",
                                                port: 80,
                                                secure: false
                                }, 'get_combined', {}, function(results) {
                                res.json(results);
                });
});




app.get('/jenkins_jobs', function (req, res) {
                var auth = new Buffer('gsebuild:welcome1').toString('base64');
                jenkins_rules.init({
                                                host: "ci.corp.equinix.com",
                                                port: 80,
                                                secure: false,
                                }, 'get_jobs', { auth: auth, job_name: 'APIGEE-FASE-PROD' }, function(results) {
                                res.json(results);
                });
});


app.get('/jenkins_builds', function (req, res) {
                var auth = new Buffer('gsebuild:welcome1').toString('base64');
                jenkins_rules.init({
                                                host: "ci.corp.equinix.com",
                                                port: 80,
                                                secure: false,
                                }, 'get_successfulbuilds', { auth: auth, job_name: 'ECX-DI-01' }, function(results) {
                                res.json(results);
                });
});



var server = app.listen(8080, function () {
                console.log('http://%s:%s', server.address().address, server.address().port);
});
