'use strict';

var workflow_api_lib = require('workflow-api-lib'),
    express = require('express'),
    app = express();
var request = require("request");

/*var mongoose = require('mongoose');
var mappingData = null;
mongoose.connect('mongodb://localhost:27017/cad');


var mappingSchema = new mongoose.Schema({
    mappingdetails: {
        sonarmapping: [{
            "ECX": []
        }, {
            "ECP": []
        }, {
            "MKP": []
        }, {
            "FASE": []
        }]
    }
});

var map = mongoose.model('Mapping', mappingSchema, 'CadCollection');
map.findById("563d4823076b2593e93ec975", function(err, doc) {
    //console.log("doc " + JSON.stringify(doc));
    mappingData = JSON.stringify(doc.mappingdetails);
    //console.log(mappingData);

});*/
//console.log(mappingData);

var data;
var mkp_loc = 0;
var ecp_loc = 0;
var ecx_loc = 0;
var blockerIssuesMKP = 0;
var criticalIssuesMKP = 0;
var blockerIssuesECX = 0;
var criticalIssuesECX = 0;
var coverage_mkp = [];
var coverage_ecp = [];
var coverage_ecx = [];
var mkp_blockerissues = [];
var mkp_criticalissues = [];
var ecp_criticalissues = [];
var ecp_blockerissues = [];
var ecx_criticalissues = [];
var ecx_blockerissues = [];
var blockerIssuesECP = 0;
var criticalIssuesECP = 0;

var sonar_rules = workflow_api_lib.createRule('/conf/rules/sonar_rules.json'),
    jenkins_rules = workflow_api_lib.createRule('/conf/rules/jenkins_rules.json'),
    jira_rules = workflow_api_lib.createRule('/conf/rules/jira_rules.json');

/*
//Login Api
request({
  uri: "http://gsejira.corp.equinix.com/rest/auth/1/session",
  method: "POST",
  json: {
                "username": "gsebuild",
                "password": "welcome1"
        },
        headers: {
                "Content-Type": "application/json"
        }
}, function(error, response, body) {

  var name = body.session.name;
  var value = body.session.value;
});
*/
/*request({
  uri: "http://gsejira.corp.equinix.com/rest/api/2/project",
  method: "GET",
  headers: {
                "Cookie":name + '='+value
    }
        
  
}, function(error, response, body) {
  console.log(body);
  
  
  });

});
*/

/* api to get all apps
 *
 */
app.get('/apps', function(req, res) {
    var mkp_loc = 0;
    var ecp_loc = 0;
    var ecx_loc = 0;
    var blockerIssuesMKP = 0;
    var criticalIssuesMKP = 0;
    var blockerIssuesECP = 0;
    var criticalIssuesECP = 0;
    var blockerIssuesECX = 0;
    var criticalIssuesECX = 0;
    sonar_rules.init({
        host: "codeanalysis.corp.equinix.com",
        port: 80,
        secure: false
    }, 'get_metrics', {}, function(results) {
        //console.log(results.metrics.data[0].msr)
        jira_rules.init({
            host: "gsejira.corp.equinix.com",
            port: 80,
            secure: false
        }, 'get_projects', {
            id: results.metrics.data[0].id
        }, function(results2) {
            //console.log("data " + results2.jiraprojects.data[0].name);
            //data = res.json({codeanalysis:results, gsejira: results2});
            var dataArray = results.metrics.data;
            var jiraProjects = results2.jiraprojects.data;
            console.log("projects " + jiraProjects);

            var mkpindex = 0;
            var ecpindex = 0;
            var ecxindex = 0;

            for (var i = 0; i < dataArray.length; i++) {

                if (dataArray[i].name.indexOf("MKP") != -1) {
                    console.log("i = " + i);
                   // console.log("criticalissues "  +dataArray[i].msr[2].val);
                    coverage_mkp[mkpindex] = dataArray[i].msr[0].val;
                    mkp_blockerissues[mkpindex] = dataArray[i].msr[1].val;
                    mkp_criticalissues[mkpindex] = dataArray[i].msr[2].val;
                    mkpindex++;
                }

                 if (dataArray[i].name.indexOf("ecp") != -1){
                console.log(dataArray[i].msr[0].val);
                console.log(dataArray[i].msr[1].val);
                   // console.log("k = "  +k);
                     console.log("ecpindex "+ ecpindex);
                     coverage_ecp[ecpindex] = dataArray[i].msr[0].val;
                     console.log("ecpcoverage "+ coverage_ecp[ecpindex] );

                    ecp_blockerissues[ecpindex] = dataArray[i].msr[1].val;
                    ecp_criticalissues[ecpindex] = dataArray[i].msr[2].val;
                    ecpindex++;
                }

                if(dataArray[i].name.indexOf("ECX") != -1){
                     coverage_ecx[ecxindex] = dataArray[i].msr[0].val;
                     ecx_blockerissues[ecxindex] = dataArray[i].msr[1].val;
                     ecx_criticalissues[ecxindex] = dataArray[i].msr[2].val;
                     ecxindex++;
                 }
                //console.log("ecp-1 " + coverage_ecp[0]);
                   // console.log("ecp-2 " + ecp_blockerissues[0]);
                   // console.log("ecp-3 " + ecp_criticalissues[0]);


                
            }
           
            for (var i = 0; i < coverage_mkp.length; i++) {

                //console.log(coverage_mkp[i][j].val);
                mkp_loc = mkp_loc + coverage_mkp[i];
               blockerIssuesMKP= blockerIssuesMKP + mkp_blockerissues[i];
               criticalIssuesMKP = criticalIssuesMKP + mkp_criticalissues[i];

            }
             console.log("MKP critical " +criticalIssuesMKP);

            for(var i = 0;i<coverage_ecp.length;i++){
                ecp_loc = ecp_loc + coverage_ecp[i];
                console.log( ecp_loc);
                blockerIssuesECP= blockerIssuesECP + ecp_blockerissues[i];
               criticalIssuesECP = criticalIssuesECP + ecp_criticalissues[i];
           }

           for(var i = 0;i<coverage_ecx.length;i++){
                ecx_loc = ecx_loc + coverage_ecx[i];
               
                blockerIssuesECX= blockerIssuesECX + ecx_blockerissues[i];
               criticalIssuesECX = criticalIssuesECX + ecx_criticalissues[i];
           }
             console.log( ecx_loc);
             console.log(blockerIssuesECX);
             console.log(criticalIssuesECX)

        
   
            //var appname;
           // console.log("fromjsonmap " + locmap.MKP);

            var appsdetails = {};
            var apps = [];

            
              
                 
                    apps.push({
                    "appname": "MKP",
                    "applead": "ABC",
                    "apptitle": "Equinix Marketplace",
                    "coverage": {
                        "linesofcode": mkp_loc,
                        "blockerissues":blockerIssuesMKP,
                        "criticalissues":criticalIssuesMKP
                    }
                },
                
                    {
                    "appname": "ECP",
                    "applead": "ABC",
                    "apptitle": "Equinix Customer Portal",
                    "coverage": {
                        "linesofcode": ecp_loc,
                        "blockerissues":blockerIssuesECP,
                        "criticalissues":criticalIssuesECP
                    }
                },
                    {
                    "appname": "ECX",
                    "applead": "ABC",
                    "apptitle": "Equinix Cloud Exchange",
                    "coverage": {
                        "linesofcode": ecx_loc,
                        "blockerissues":blockerIssuesECX,
                        "criticalissues":criticalIssuesECX
                    }

                });
               
            


            appsdetails.apps = apps;
            var obj = appsdetails.apps;

            var finalobj = {
                appdetails: {
                    apps: obj
                }
            };
            // console.log("appjson " +JSON.stringify({appdetails:{
            // apps:obj}}));
            res.json(finalobj);

        });

    });
});

app.get('/projects', function(req, res) {
    jira_rules.init({
        host: "gsejira.corp.equinix.com",
        port: 80,
        secure: false
    }, 'get_projects', {}, function(response) {
        res.json(response);
    });
});



app.get('/combined', function(req, res) {
    sonar_rules.init({
        host: "codeanalysis.corp.equinix.com",
        port: 80,
        secure: false
    }, 'get_combined', {}, function(results) {
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
            res.json({
                codeanalysis: results,
                gsejira: results2
            });

        });
    });
});

app.get('/profiles', function(req, res) {
    sonar_rules.init({
        host: "codeanalysis.corp.equinix.com",
        port: 80,
        secure: false
    }, 'get_profiles', {}, function(results) {
        res.json(results);
    });
});

app.get('/sonar', function(req, res) {
    sonar_rules.init({
        host: "codeanalysis.corp.equinix.com",
        port: 80,
        secure: false
    }, 'get_combined', {}, function(results) {
        res.json(results);
    });
});

app.get('/jenkins_jobs', function(req, res) {
    var auth = new Buffer('gsebuild:welcome1').toString('base64');
    jenkins_rules.init({
        host: "ci.corp.equinix.com",
        port: 80,
        secure: false,
    }, 'get_jobs', {
        auth: auth,
        job_name: 'APIGEE-FASE-PROD'
    }, function(results) {
        res.json(results);
    });
});

app.get('/jenkins_builds', function(req, res) {
    var auth = new Buffer('gsebuild:welcome1').toString('base64');
    jenkins_rules.init({
        host: "ci.corp.equinix.com",
        port: 80,
        secure: false,
    }, 'get_successfulbuilds', {
        auth: auth,
        job_name: 'ECX-DI-01'
    }, function(results) {
        res.json(results);
    });
});

var server = app.listen(8009, function() {
    console.log('http://%s:%s', server.address().address, server.address().port);
});
