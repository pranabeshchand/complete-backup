var express = require('express');
var router = express.Router();
var sales = require('node-salesforce');
var CircularJson = require('circular-json');
var config = require('./../config/config');
var database = require('./../config/db');
var request = require('request');
var fs = require('fs');
var node_dropbox = require('node-dropbox');
var csv = require('csv');
var googleAuth = require('google-auth-library');
var google = require('googleapis');
var multer = require('multer')
var co = require('co');
var q = require('q');
var _ = require('lodash');
var __ = require('underscore');
var CircularJson = require('circular-json');
var JSFtp = require("jsftp");
var Client = require('ssh2-sftp-client');
var CsvReader = require('csv-reader');
var jsonparser = require('jsonparsertool/lib');
var ObjectID = require('objectid');
var moment = require('moment');
var requestPromise = require('request-promise-native');
var oauth = require('./AccessToken');
var mapping = require('./mapping');
var Token = require('./AccessToken');
/*var async = require('async');
var await = require('await');*/
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var bluebirdPromise = require('bluebird');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // cb(null, './../test')

        cb(null, __dirname);
    },
    filename: function (req, file, cb) {
        console.log("file obj is " + JSON.stringify(file, null, 2));
        cb(null, file.fieldname + '-' + Date.now())
    }
})


var upload = multer({storage: storage}).any();

router.get('/', function (req, res, next) {
    res.send('respond with a api resource');
});


router.get('/logout', function (req, res) {

    var conn = new sales.Connection({
        sessionId : '00D28000001EkAz!AQwAQIEqz9ViS49XVvKSwbqYHTjPYIgeye9IduA.g7qFukyKgq3akz182fI1Tv.WGEnTd9NUIrIawBoWlPhFgEI.1.MqWxuI',
        serverUrl : 'https://ap2.salesforce.com'
    });
    conn.logout(function(err) {
        console.error("err in logout" + err);
        if (err) {

        }
        // now the session has been expired.
    });
})

router.get('/salesObjects', function (req, res, next) {

    salesforceInstance(req.session.userId).then(function (sfconnection) {
        sfconnection.describeGlobal(function (err, result) {
            if (err) {
                console.error(err);
                res.status(400).send(err)

            }
            console.log('Num of SObjects : ' + result.sobjects.length);
            res.status(200).send(JSON.stringify(result.sobjects, null, 2));
        });
    }, function (err) {
        res.status(400).send({error: err});
    })

});


router.get('/salesObjects/:objectName/attributes', function (req, res, next) {
    console.log("api get called.................................");
    var objName = req.params.objectName;
    salesObjectAttributes(req.session.userId, objName).then(function (fieldsArray) {
        res.status(200).send(fieldsArray);
    }, function (err) {
        res.status(400).send(err);
    })
});

function salesObjectAttributes(userId, objectName) {
    var defer = q.defer();
    salesforceInstance(userId).then(function (sfconnection) {
        sfconnection.sobject(objectName).describe$(function (err, meta) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(meta.fields);
            }
        });
    }, function (err) {
        defer.reject(err);
    })
    return defer.promise;
}

function generateObjectAndKeysFromMapping(sfobj, mappingAttributes) {

    var ObjectAndKeys = {};
    var simpleKeys = [];
    var relatedObj;
    var relatedKeys = [];
    var type = 'simple';
    for (var key in mappingAttributes) {
        type = 'simple';
        relatedKeys = [];
        var obj = mappingAttributes[key];
        for (var keyname in obj) {
            if (typeof obj[keyname] == 'object') {
                relatedKeys.push(keyname);
                type = 'related'
                relatedObj = obj[keyname]['referenceTo']
            }
        }

        if (type == 'simple') {
            simpleKeys.push(key);
        } else {
            ObjectAndKeys[relatedObj] = relatedKeys;
        }
    }
    ObjectAndKeys[sfobj] = simpleKeys;
    return ObjectAndKeys;
}

function ChangeMappingForDB(attributeobj) {
    for (var key in attributeobj) {
        var keyname = key.split('.');
        if (keyname.length > 1) {
            var keyvalue = attributeobj[keyname[0]]
            if (keyvalue) {
                keyvalue[keyname[1]] = attributeobj[key];
            } else {
                var ob = {}
                ob[keyname[1]] = attributeobj[key];
                attributeobj[keyname[0]] = ob
            }
            delete attributeobj[key];
        }
    }
    return attributeobj;
}

function mappingKeysValidation(userId, obj) {
    return co(function* () {
        try {
            var missingAttributesObject = {};
            var promises = [];
            var requiredSalesAttributes = []
            var StandardSalesForceFields = config.StandardSalesForceFields;
            var salesObjects = [];
            for (var sobject in obj) {
                salesObjects.push(sobject);
                promises.push(salesObjectAttributes(userId, sobject));
            }
            var data = yield promises;
            for (var i = 0; i < data.length; i++) {
                requiredSalesAttributes = [];
                var mappingKeys = obj[salesObjects[i]]
                var missingKeys = [];
                var totalFields = data[i].length;
                for (var j = 0; j < totalFields; j++) {
                    if (data[i][j].nillable == false && StandardSalesForceFields.indexOf(data[i][j].name) == -1) {
                        requiredSalesAttributes.push(data[i][j].name);
                    }
                }
                for (var j = 0; j < requiredSalesAttributes.length; j++) {
                    if (mappingKeys.indexOf(requiredSalesAttributes[j]) == -1) {
                        missingKeys.push(requiredSalesAttributes[j]);
                    }
                }
                if (missingKeys.length > 0) {
                    missingAttributesObject[salesObjects[i]] = missingKeys;
                }
            }
            if (Object.keys(missingAttributesObject).length == 0) {
                return ({requiredValidation: true, salesObjects: salesObjects, fieldsArray: data});
            } else {
                return ({
                    requiredValidation: false,
                    data: missingAttributesObject,
                    salesObjects: salesObjects,
                    fieldsArray: data
                });
            }

        } catch (e) {
            return e;
        }

    })
}

router.post('/saveobjectmapping', function (req, res, next) {
    co(function* () {
        try {
            var userId = req.session.userId;
            var mappingobj = req.body;
            mappingobj.userId = userId;
            console.log("mappingobj is " + JSON.stringify(mappingobj, null, 2));
            if (mappingobj.type == 'import') {
                task = 'import';
            } else {
                task = 'export'
            }
            var salesObject = mappingobj.mapping.object;

            if (task == 'import') {
                // var data = yield createTask(userId, mappingobj);
                var sfconnection = yield salesforceInstance(userId);
                // var result = yield processCSV(mappingobj, sfconnection, result.salesObjects, result.fieldArray);
                var mappingAttributes = mappingobj.mapping.attributes;
                mappingAttributes = ChangeMappingForDB(mappingAttributes);
                var cronExpression = {
                    Seconds: "*",
                    Minutes: "*",
                    Hours: "*",
                    DayofMonth: "*",
                    Months: "*",
                    DayofWeek: "*"
                }
                if (mappingobj.schedule) {
                    var scheduleTime = mappingobj.schedule.scheduleTime.split(':');
                    cronExpression.Hours = scheduleTime[0];
                    cronExpression.Minutes = scheduleTime[1];
                    var start = new Date(mappingobj.schedule.startDate).getDate();
                    var end = new Date(mappingobj.schedule.endDate).getDate();

                    if (mappingobj.schedule.scheduleType == 'Daily') {
                        cronExpression.DayofMonth = start + '-' + end;
                    } else if (mappingobj.schedule.scheduleType == 'Hourly') {
                        cronExpression.Hours = "*";
                    } else if (mappingobj.schedule.scheduleType == 'Monthly') {
                        cronExpression.DayofMonth = start
                    } else {
                        cronExpression.Months = new Date(mappingobj.schedule.startDate).getMonth();
                    }
                    mappingobj.cronExpression = cronExpression.Seconds + ' ' + cronExpression.Minutes + ' ' + cronExpression.Hours + ' ' + cronExpression.DayofMonth + ' ' + cronExpression.Months + ' ' + cronExpression.DayofWeek;
                }
                if (mappingobj._id) {
                    var data = yield updateTask(mappingobj._id, mappingobj);
                    console.log('Update block Success ' + data);
                } else {
                    var data = yield createTask(userId, mappingobj);
                }
                yield mapping.processCSV(mappingobj, sfconnection, userId);
                console.log("mappingobj which will be passed for processing " + JSON.stringify(mappingobj, null, 2));
                res.status(200).send({result: 'success', data: data});
                /*var mappingAttributes = mappingobj.mapping.attributes;
                 var ObjectAndKeys = generateObjectAndKeysFromMapping(salesObject, mappingAttributes);
                 console.log("ObjectAndKeys " + JSON.stringify(ObjectAndKeys, null, 2));
                 var result = yield mappingKeysValidation(userId, ObjectAndKeys);
                 if (result.requiredValidation) {
                 mappingAttributes = ChangeMappingForDB(mappingAttributes);
                 var data = yield createTask(userId, mappingobj);
                 var sfconnection = yield salesforceInstance(userId);
                 var result = yield processCSV(mappingobj, sfconnection, result.salesObjects, result.fieldArray);
                 res.status(200).send({result: 'success', data: data});

                 } else {
                 res.status(400).send({requiredValidation: false, data: result.data})
                 }*/
            } else {
                if (mappingobj._id) {
                    var data = yield updateTask(mappingobj._id, mappingobj);
                    console.log('Update Block Success ' + data);
                } else {
                    var data = yield createTask(userId, mappingobj);
                }
                //var data = yield createTask(userId, mappingobj);
                var sfconnection = yield salesforceInstance(userId);
                yield mapping.processExport(mappingobj, sfconnection, soql);
            }
        } catch (e) {

            console.log("exception is " + e);
            res.status(400).send({err: err});
        }

    })

});

router.get('/sflogin', function (req, res, next) {
    console.log("api called....");
    var conn = new sales.OAuth2(config.SalesForce);
    res.redirect(conn.getAuthorizationUrl({scope: 'api web id openid profile refresh_token'}));
});

router.get('/authorize', function (req, res, next) {
    // console.log("api called....");
    if (req.session.userId) {
        try {
            currentUserInfo(req.session.userId).then(function (data) {
                res.status(200).send({loggedIn: true, user: data});

            }, function (err) {
                res.status(400).send({loggedIn: false});
            })
        } catch (e) {
            console.log("exception ***** " + e);
        }


    } else {
        res.status(200).send({loggedIn: false});
    }

});


router.get('/oauth2/callback', function (req, res) {

    var oauth2 = new sales.OAuth2(config.SalesForce);
    var conn = new sales.Connection({oauth2: oauth2});
    var code = req.param('code');
    console.log("code is " + code);
    try {
        conn.authorize(code, function (err, userInfo) {
            console.log("userInfo is " + JSON.stringify(userInfo, null, 2));
            console.log("conn is " + conn.accessToken);
            if (err) {
                return console.error(err);
            }
            var db = database.getDB();
            try {
                db.collection('User').find({user_id: userInfo.id}).toArray(function (err, data) {
                    if (err) {
                        console.log(err);
                        // q.reject(err);
                    } else {
                        console.log("user data in db is " + JSON.stringify(data));
                        if (data.length == 0) {
                            var options = {
                                url: userInfo.url + '?oauth_token=' + conn.accessToken,

                            }
                            request(options, function (err, response, body) {
                                console.log("err in callback is " + err);
                                console.log("response is " + response);
                                console.log("body is " + body);
                                console.log("username  is " + JSON.parse(body).username);
                                var userdata = JSON.parse(body);
                                userdata.accessToken = conn.accessToken;
                                userdata.refreshToken = conn.refreshToken;
                                userdata.instanceUrl = conn.instanceUrl;
                                userdata.password = 'Angularjs@2Cuo3nKWuEKhMNPglyCEtjDn8';
                                db.collection('User').insert(userdata, function (err, records) {
                                    if (err) {
                                        res.status(400).send(err);
                                    }
                                    console.log("user created in database " + JSON.stringify(records, null, 2));
                                    req.session.userId = records.ops[0].user_id;
                                    req.session.save();
                                    res.redirect("http://localhost:3000/import");
                                    // res.redirect("/export");
                                });
                            })


                        } else {
                            req.session.userId = data[0].user_id;
                            req.session.save();
                            res.redirect("http://localhost:3000/import");
                        }
                    }
                    //q.resolve(data[0]);
                })

            } catch (e) {
                console.log("exception " + e);
                // q.reject(e);
            }


        })
    } catch (e) {
        console.log("exception s " + e);
    }
})

router.post('/fetchrecords', function (req, res, next) {
    console.log("called................" + res);
    var soql = req.body.soql;
    salesforceInstance(req.session.userId).then(function (sfconnection) {
        sfconnection.query(soql, function (err, result) {
            if (err) {
                res.status(400).send(err.message);
            }
            res.status(200).send(result);
        })
    })


});

router.post('/uploadfile', function (req, res) {
    var csvheader;
    req.on('data', function (chunk) {
        if (!csvheader) {
            var textChunk = chunk.toString('utf8');
            textChunk = textChunk.split(/\r\n|\n/);
            csvheader = textChunk[4].split(',');
            console.log(csvheader)
        }
    });
    //console.log("uploadfile called.................." + CircularJson.stringify(req,null,2));
    upload(req, res, function (err) {
        if (err) {
            res.status(400).send({"error": err});
        } else {
            res.status(200).send({"status": true, "csvHeader": csvheader, "fileName": req.files[0].filename});
        }
    })
});

router.get('/remotefile', function (req, res) {
    co(function*() {
        try {
            if (req.query.file_path) {
                var obj = JSON.parse(req.query.file_path);
            }
            console.log("obj in remotefile is " + JSON.stringify(obj,null,2));
            var connection = yield mapping.getConnectionDetails(req.session.userId, obj.connection);
            console.log("conn in remotefile is " + JSON.stringify(connection,null,2));
            var filedata = yield mapping.readCloudFile(connection, obj.file_path, true);
            res.status(200).send({"status": true, "csvHeader": mapping.chunkToUTF8(filedata), "fileName": obj.file_path});
        } catch (e) {
            console.log("exception in remote file api " + e);
            res.status(400).send({status: false, error: e});
        }
    })
})


router.get('/dropbox', function (req, res) {

    node_dropbox.Authenticate(config.DropBox.key, config.DropBox.secret, config.DropBox.redirect_url, function (err, url) {
        res.redirect(url);
    });
});

router.get('/oauth/dropbox', function (req, res) {

    var code = req.param('code');
    // var db = res.app.get('database');
    console.log("code is " + code);
    node_dropbox.AccessToken(config.DropBox.key, config.DropBox.secret, code, config.DropBox.redirect_url, function (err, body) {
        var access_token = body.access_token;
        console.log("dropbox response is  " + JSON.stringify(body, null, 2));
        try {
            var api = node_dropbox.api(access_token);
            api.account(function (err, response, body) {
                console.log(body);

                var connectionObj = {"email": body.email, "type": 'dropbox', "access_token": access_token};
                saveConnection(req.session.userId, connectionObj).then(function (data) {
                    console.log("data from saveconn " + JSON.stringify(data, null, 2));
                    if (data) {
                        delete connectionObj.access_token

                        res.status(200).send({status: true, connections: data.connections});
                    }
                }, function (err) {
                    res.status(400).send({"status": false});
                })
            });

        } catch (e) {
            console.log("exception is " + e);
        }
    });
})

function getOauth2Client() {
    var clientSecret = config.GoogleDrive.client_secret;
    var clientId = config.GoogleDrive.client_id;
    var redirectUrl = config.GoogleDrive.redirect_uris;
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    return oauth2Client;
}


router.get('/drive', function (req, res) {

    var oauth2Client = getOauth2Client();
    var SCOPES = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/plus.profile.emails.read'];
    console.log("oauth2Client is " + oauth2Client);
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    res.redirect(authUrl);
})

router.get('/box', function (req, res) {

    res.redirect('https://account.box.com/api/oauth2/authorize?response_type=code&client_id=' + config.Box.client_id + '&redirect_uri=http://localhost:3000/api/oauth/box&state=123456');

})

router.get('/oauth/box', function (req, res) {
    console.log("box code " + req.param('code'));
    console.log("box state " + req.param('state'));
    var code = req.param('code');
    try {
        var options = {
            url: 'https://api.box.com/oauth2/token',
            method: 'POST',
            json: true,
            form: {
                grant_type: 'authorization_code',
                code: code,
                client_id: config.Box.client_id,
                client_secret: config.Box.client_secret
            }
        }
        //console.log("param are " + JSON.stringify(options.qs,null,2));
        request(options, function (err, response, body) {
            console.log("err is " + err);
            console.log("response is " + response.statusCode);
            console.log("body is " + JSON.stringify(body, null, 2));

            var options1 = {
                url: 'https://api.box.com/2.0/users/me?access_token=' + body.access_token,
                method: 'GET',
            }

            request(options1, function (err, response, data) {
                console.log("err is ***" + err);
                console.log("response is ***" + response.statusCode);
                console.log("data is ***" + data);

                var connectionInstance = {
                    type: 'box',
                    email: JSON.parse(data).login,
                    access_token: body.access_token,
                    refresh_token: body.refresh_token,
                    expires_in: body.expires_in
                }
                console.log("box connection instance is " + JSON.stringify(connectionInstance, null, 2));

                saveConnection(req.session.userId, connectionInstance).then(function (data) {
                    console.log("data from saveconn " + JSON.stringify(data, null, 2));
                    if (data) {
                        delete connectionInstance.access_token

                        res.status(200).send({status: true, connections: data.connections});
                    }
                }, function (err) {
                    res.status(400).send({"status": false});
                })

            })

        })


    } catch (e) {
        console.log("exception " + e);
    }

})

router.get('/oauth/drive', function (req, res) {
    console.log("drive redirect url called.......... ");
    var code = req.param('code');
    console.log("params are " + code);
    var oauth2Client = getOauth2Client();
    oauth2Client.getToken(code, function (err, token) {

        oauth2Client.setCredentials({
            access_token: token.access_token,
            refresh_token: token.refresh_token
        });


        var plus = google.plus('v1');
        plus.people.get({
            userId: 'me',
            auth: oauth2Client
        }, function (err, user) {
            var connectionObj = {
                "email": user.emails[0].value,
                "type": 'google_drive',
                "access_token": token.access_token,
                "refresh-token": token.refresh_token,
                "id_token": token.id_token
            };
            saveConnection(req.session.userId, connectionObj).then(function (data) {

                if (data) {
                    res.status(200).send({status: true, connections: data.connections});
                }
            }, function (err) {
                res.status(400).send({"status": false});
            })
            console.log("err is " + JSON.stringify(err, null, 2));
            console.log("user response is " + JSON.stringify(user, null, 2));
        });
    });
})

function driveFilesFolders(userId, connection, path) {
    co(function* () {
        try {
            var options = {
                method: "GET",
                url: "https://www.googleapis.com/drive/v3/files?q='" + path + "' in parents &access_token=" + connection.access_token
            }
            console.log("options are " + options.url);
            var body = yield requestPromise(options);
            if(body.error.code == 401) {
                var token = yield Token.getNewAccessToken("GoogleDrive", connection.refresh_token);
                connection.access_token = token.access_token;
                connection.refresh_token = token.refresh_token;
               // update the same into db
                driveFilesFolders(userId,connection,path);
            } else {
                var files = JSON.parse(body).files;
                for (var i = 0; i < files.length; i++) {
                    if (files[i].mimeType == 'application/vnd.google-apps.folder') {
                        files[i].is_dir = true;
                    } else {
                        files[i].is_dir = false;
                    }
                }
                return files;
            }
        } catch(e) {
            return e;
        }
    })
}

function updateTokens(userId, connection) {


}

router.get('/connections', function (req, res) {
    var db = database.getDB();
    var param = ''
    var connection = ''
    var path = ''
    console.log("param in connections are " + req.query.path);

    param = JSON.parse(req.query.path);
    path = param.path;
    connection = param.connection;


    db.collection('User').find({user_id: req.session.userId}).toArray(function (err, data) {
        if (err) {
            res.status(400).send({error: err});
        } else {
            var connections = data[0].connections || {};
            var conn = connections[connection.type] ? connections[connection.type] : [];
            var connectionobj = {};
            console.log("conn is ***" + JSON.stringify(conn, null, 2));
            if (!connection.email) {
                // connectionobj = conn[conn.length - 1]
                connectionobj = conn[0]
            } else {
                connectionobj = _.find(conn, connection)
            }


            console.log("connection is ....." + JSON.stringify(connectionobj, null, 2));
            if (connection.type == 'dropbox') {
                var api = node_dropbox.api(connectionobj.access_token);
                api.getMetadata(path || '', function (err, response, body) {
                    if (err) {
                        console.log("err is " + err);

                    } else {
                        console.log("response is " + JSON.stringify(response, null, 2));
                        console.log("body is " + JSON.stringify(body, null, 2));
                        delete connectionobj.access_token;
                        for (var i = 0; i < body.contents.length; i++) {
                            //var currentRecord = body.contents[i];
                            body.contents[i].name = body.contents[i].path.substring(body.contents[i].path.lastIndexOf('/') + 1, body.contents[i].path.length);
                        }
                        res.status(200).send({connection: connections, data: body});

                    }
                })
            } else if (connection.type == 'box') {
                console.log("access token for box " + connectionobj.access_token);
                getByFolderId(connectionobj.access_token, path || 0).then(function (data) {
                    res.status(200).send({connection: connections, data: data});

                }, function (err) {
                    res.status(400).send({err: err});
                })
            } else if (connection.type == 'ftp' || connection.type == 'sftp') {
                fileTransferConnection(connection, path || '.').then(function (data) {
                    res.status(200).send({connection: connections, data: data});
                }, function (err) {
                    res.status(400).send({err: err});
                })
            } else if (connection.type == 'google_drive') {
                driveFilesFolders(req.session.userId,connectionobj, path || 'root').then(function (data) {
                    res.status(200).send({connection: connections, data: data});
                }), function (err) {
                    res.status(400).send({err: err});
                }
            }

        }
    })


})

function getByFolderId(access_token, folder_id) {
    var defer = q.defer();
    var options = {
        url: 'https://api.box.com/2.0/folders/' + folder_id + '?access_token=' + access_token,
        method: 'GET'
    }
    console.log("box url is " + options.url);
    request(options, function (err, response, body) {
        if (err) {
            console.log("err in box " + err);
            defer.reject(err);
        } else {
            var data = JSON.parse(body).item_collection.entries;
            for (var i = 0; i < data.length; i++) {
                if (data[i].type == 'folder') {
                    data[i].is_dir = true;
                } else {
                    data[i].is_dir = false;
                }
            }
            defer.resolve(data);
        }

    })
    return defer.promise;
}

router.post('/ftpconnection', function (req, res) {
    var fileTransferObj = req.body;
    console.log("fileTransfer obj is " + JSON.stringify(fileTransferObj, null, 2));
    fileTransferConnection(fileTransferObj).then(function (data) {
        saveConnection(req.session.userId, fileTransferObj).then(function (connection) {
            res.status(200).send({connection: connection, data: data});
        }, function (err) {
            res.status(400).send({err: err});
        })
    }, function (err) {
        res.status(400).send({err: err});
    })


})

router.post('/dbmsconnection', function (req, res) {
    var fileTransferObj = req.body;
    console.log("fileTransfer obj is " + JSON.stringify(fileTransferObj, null, 2));
    var mysql = require('mysql');
    var connection = mysql.createConnection({
        host: fileTransferObj.host,
        user: fileTransferObj.username,
        password: fileTransferObj.password,
        database: fileTransferObj.database
    });
    connection.connect(function (err) {
        if (err) {
            console.log('Error connecting to Db');
            return;
        }
        console.log('Connection established');
    });
    //fileTransferConnection(fileTransferObj).then(function (data) {
    saveConnection(req.session.userId, fileTransferObj).then(function (connection) {
        console.log("fffffffffff " + connection);
        res.status(200).send({connection: connection, data: data});
    }, function (err) {
        console.log("zzzzzzzzzzzz  " + err);
        res.status(400).send({err: err});
    })
    /* }, function (err) {
     res.status(400).send({err: err});
     })*/


})

router.post('/removeconnection', function (req, res) {
    removeconnection(req.body, req.session.userId).then(function (data) {
        res.status(200).send({connection: data});
    }, function (err) {
        res.status(400).send({err: err});
    })
})

function removeconnection(conn, userId) {
    console.log("remove conn " + JSON.stringify(conn, null, 2));
    var defer = q.defer();
    try {
        var removeconn = conn;
        var conntype = removeconn['type'];
        var db = database.getDB();
        db.collection('User').find({user_id: userId}).toArray(function (err, data) {
            if (err) {
                console.log("err is " + err);
                defer.reject(err);

            } else {
                var connections = data[0].connections;

                if (connections[conntype].length == 1) {
                    delete connections[conntype];
                } else {
                    _.remove(connections[conntype], removeconn);
                }
                var setquery = {$set: {"connections": connections}};
                db.collection('User').update({user_id: {$eq: userId}}, setquery, {upsert: true}, function (error, count, result) {
                    if (err) {
                        console.log("err is " + err);
                        defer.reject(err);
                    } else {
                        console.log("count is " + count);
                        //defer.resolve({connections: connections});
                        defer.resolve(connections);
                    }
                })
            }
        })
    } catch (e) {
        console.log("exception " + e);
        defer.reject(e);
    }

    return defer.promise;
}

function fileTransferConnection(filetransferobj, dirPath) {
    console.log("dir path is " + dirPath);
    var defer = q.defer();
    if (filetransferobj.type == 'ftp') {
        var Ftp = new JSFtp({
            host: filetransferobj.host,
            port: filetransferobj.port,
            user: filetransferobj.username,
            pass: filetransferobj.password
        });

        try {
            Ftp.ls(dirPath || ".", function (err, data) {
                if (err) {
                    //res.status(400).send({msg: err});
                    defer.reject(err);
                } else {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].type == 1) {
                            data[i].is_dir = true;
                        } else {
                            data[i].is_dir = false;
                        }
                    }
                    /* fs.writeFile('ftp.json', JSON.stringify(data, null, 2), function (err) {
                     if (err) return console.log(err);
                     console.log('Hello World > helloworld.txt');
                     });*/
                    defer.resolve(data);

                }

            });
        } catch (e) {
            console.log("exception ftp " + e);
            defer.reject(err);
        }

    } else {
        var sftp = new Client();
        sftp.connect({
            host: filetransferobj.host,
            port: filetransferobj.port,
            username: filetransferobj.username,
            password: filetransferobj.password
        }).then(() => {
            return sftp.list(dirPath || '.');
        }).then((data) => {
            fs.writeFile('sftp.json', JSON.stringify(data, null, 2), function (err) {
                if (err) {
                    defer.reject(err);
                }
            });
            for (var i = 0; i < data.length; i++) {
                if (data[i].type == 'd') {
                    data[i].is_dir = true;
                } else {
                    data[i].is_dir = false;
                }
            }
            defer.resolve(data);
        }).catch((err) => {
            defer.reject(err);
        });
    }
    return defer.promise;
}

function sfLoginWithCredentials(userId) {
    var defer = q.defer();
    var conn = new sales.Connection({});

    currentUserInfo(userId).then(function (userdetails) {
        //console.log("userdetails in sfLoginWithCredentials " + JSON.stringify(userdetails,null,2));
        conn.login(userdetails.username, userdetails.password, function (err, userInfo) {
            if (err) {
                console.error("err with password login " + err);
                defer.reject(err);
            } else {
                //console.log("login with password " + JSON.stringify(userInfo,null,2));
                defer.resolve({accessToken: conn.accessToken, instanceUrl: conn.instanceUrl});
            }
            // Now you can get the access token and instance URL information.
            // Save them to establish connection next time.
        });
    }, function (err) {
        defer.reject(err);
    })

    return defer.promise;
}

router.get('/foldermetadata', function (req, res) {
    var path = req.query.path.path;
    var connection = JSON.parse(req.query.path.connection);
    console.log("path is " + path);
    console.log("connection is " + JSON.stringify(connection, null, 2));
    var api =
        api.getMetadata('', function (err, response, body) {
            if (err) {
                console.log("err is " + err);

            } else {
                console.log("response is " + JSON.stringify(response, null, 2));
                console.log("body is " + JSON.stringify(body, null, 2));
                res.status(200).send({data: body});


            }
        })
    console.log("path in foldermetadata is " + path);


})

router.get('/listalltask', function (req, res) {
    co(function* () {
        try {
            var query = {userId: req.session.userId};
            var taskArray = yield listAllTAsk(query);
            console.log("taskarr is " + taskArray);
            res.status(200).send({taskArray: taskArray});
        } catch (e) {
            res.status(400).send({err: e});
        }

    })
})

router.get('/deleteTask', function (req, res) {
    co(function*() {
        try {
            var db = database.getDB();
            var recordId = req.param('id');
            console.log("recordId is....... " + recordId);
            var tasks = yield deleteTask(req.session.userId, recordId);
            res.status(200).send({status: true, taskArray: tasks});
        } catch (e) {
            console.log
            res.status(400).send({status: false, err: JSON.stringify(e)});
        }

    })
})

function listAllTAsk(query) {
    console.log("called....");
    return co(function* () {
        try {
            var db = database.getDB();
            var data = yield db.collection('Task').find(query).toArray();
            console.log("data is " + JSON.stringify(data, null, 2));
            return data;
        } catch (err) {
            return err;
        }
    })
}
router.get('/readTaskcsv', function (req, res) {
    return co(function*() {
        try {
            var db = database.getDB();
            var filename = req.param('filename');
            console.log("filename is " + filename);
            var filename = "http://localhost:3000/routes/" + filename;
            var tasks = yield readTaskcsv(filename);
            console.log('tasks.....' + tasks);
            res.status(200).send({status: true, header: tasks});
        } catch (e) {

            res.status(400).send({status: false, err: JSON.stringify(e)});
        }

    })
})
router.post('/testConnection', async function (req, res) {
    var dbtype = "";
    console.log("dssdsd");
    try{
            if(req.body.databaseServer == "mysql"){
                dbtype = require("./dbms/mysql");
            }
            if(req.body.databaseServer == "oracle"){
                dbtype = require("./dbms/oracle");
            }

                var list =  dbtype.listDatabases(req.body.data);
                list.then(function(result) {
                    res.status(200).send(result);
                },function(e) {
                    console.log("err is " + e);
                    res.status(200).send({status: false, err: JSON.stringify(e)});

                });
        } catch(e) {
            res.status(400).send({status: false, err: JSON.stringify(e)});
        }
});
router.post('/listTabels',async function(req, res){
    var dbtype = "";
     try{
            if(req.body.databaseServer == "mysql"){
                dbtype = require("./dbms/mysql");
            }
            if(req.body.databaseServer == "oracle"){
                dbtype = require("./dbms/oracle");
            }
                var list =  dbtype.listTabels(req.body.data);
                list.then(function(result) {
                    res.status(200).send(result);
                },function(e) {
                    res.status(200).send({status: false, err: JSON.stringify(e)});

                });
    } catch(e) {
        console.log("error ",e);
        res.status(400).send({status: false, err: JSON.stringify(e)});
    }

});

router.post('/describeTable',async function(req, res){
    var dbtype = "";
     try{
            if(req.body.databaseServer == "mysql"){
                dbtype = require("./dbms/mysql");
            }
            if(req.body.databaseServer == "oracle"){
                dbtype = require("./dbms/oracle");
            }
                var list =  dbtype.describeTable(req.body.data, req.body.tableName);
                list.then(function(result) {
                     res.status(200).send(result);
                },function(e) {
                     res.status(200).send({status: false, err: JSON.stringify(e)});

                });
    } catch(e) {
        console.log("error ",e);
        res.status(400).send({status: false, err: JSON.stringify(e)});
    }
});
router.post('/listRelations',async function(req, res){
    var dbtype = "";
    try{
        if(req.body.databaseServer == "mysql"){
            dbtype = require("./dbms/mysql");
        }
        if(req.body.databaseServer == "oracle"){
            dbtype = require("./dbms/oracle");
        }
         var list =  dbtype.listRelations(req.body.data, req.body.tableName);
        list.then(function(result) {
             res.status(200).send({status: true, res: result});
        },function(e) {
             res.status(200).send({status: false, err: JSON.stringify(e)});

        });
    } catch(e) {
        console.log("error ",e);
        res.status(400).send({status: false, err: JSON.stringify(e)});
    }

});

function readTaskcsv(filename) {
    return co(function*() {

        return requestPromise(filename)
            .then(function (body) {
                if (body) {

                    var textChunk = body.toString('utf8');
                    textChunk = textChunk.split(/\r\n|\n/);
                    console.log('reading csv ' + textChunk);
                    var csvheader = textChunk[0].split(',');
                    console.log("csvheader is " + csvheader);
                    return csvheader;
                    //res.status(200).send({"status": true, "csvHeader": csvheader, "fileName": obj.file_path});
                }
            })
            .catch(function (err) {
                console.log('errroooooo ' + err);
                // Crawling failed or Cheerio choked...
            });
        /*request.get(filename, function (err, response, body) {
         if (err) {
         res.status(400).send({err: err});
         } else {
         var textChunk = body.toString('utf8');
         textChunk = textChunk.split(/\r\n|\n/);
         console.log('reading csv '+textChunk);
         var csvheader = textChunk[0].split(',');
         console.log("csvheader is " + csvheader);
         return csvheader;
         //res.status(200).send({"status": true, "csvHeader": csvheader, "fileName": obj.file_path});
         }
         })*/
    })

}
function salesforceInstance(userId) {
    var defer = q.defer();
    try {
        var sfobj = {
            oauth2: config.SalesForce
        }

        // var db = database.getDB();
        // var data = yield db.collection('User').find({user_id: userId}).toArray();
        //console.log("data is " + JSON.stringify(data[0], null, 2));
        sfLoginWithCredentials(userId).then(function (data) {
            console.log("data from sfLoginWithCredentials " + JSON.stringify(data, null, 2));
            sfobj.instanceUrl = data.instanceUrl;
            sfobj.accessToken = data.accessToken;
            //sfobj.refreshToken = data[0].refreshToken;
            defer.resolve(new sales.Connection(sfobj));
        }, function (err) {
            defer.reject(err);
        })
    } catch (e) {
        console.log("exception in sfinstance " + e);
        return e;
    }
    return defer.promise;
}

function saveConnection(userId, connectionInstance) {
    var defer = q.defer();
    var db = database.getDB();
    console.log("userId is " + userId);
    db.collection('User').find({user_id: userId}).toArray(function (err, userdata) {
        if (err) {
            defer.reject(false);
            console.log("err is " + err);
        } else {
            console.log("userdata is " + JSON.stringify(userdata, null, 2));
            var connectionType = connectionInstance.type;

            var connections = userdata[0].connections || {}
            if (connections[connectionType]) {

            }
            var conn = connections[connectionType] ? connections[connectionType] : [];
            console.log("conn for find " + JSON.stringify(conn, null, 2));
            console.log("connectionInstance for find " + JSON.stringify(connectionInstance, null, 2));
            var obj = {};
            if (connectionInstance.type == 'ftp' || connectionInstance.type == 'sftp' || connectionInstance.type == 'mysql') {
                if (connectionInstance.type == 'mysql') {
                    obj = _.find(conn, {
                        host: connectionInstance.host,
                        username: connectionInstance.username,
                        database: connectionInstance.database
                    });
                } else {
                    obj = _.find(conn, {host: connectionInstance.host});
                }

            } else {
                obj = _.find(conn, {type: connectionInstance.type, email: connectionInstance.email});
                console.log("emailllll " + connectionInstance.email);
            }

            if (obj) {
                // defer.resolve({connections: connections});
                defer.resolve(connections);
            } else {
                // conn.push(connectionInstance);
                conn.unshift(connectionInstance);
                connections[connectionType] = conn;

                //conn[connectionType] = [connectionInstance];
                var setquery = {$set: {"connections": connections}};
                console.log("user is " + JSON.stringify(userdata[0], null, 2));
                db.collection('User').update({user_id: {$eq: userId}}, setquery, {upsert: true}, function (error, count, result) {
                    if (err) {
                        console.log("err is " + err);
                        defer.reject(false);
                    } else {
                        console.log("count is " + count);
                        //defer.resolve({connections: connections});
                        defer.resolve(connections);
                    }
                })
            }
        }
    })
    return defer.promise;
}

function getConnectionDetails(userId, connectionInstance) {
    return co(function*() {
        try {
            var db = database.getDB();
            console.log("userId in getConnectionDetails " + userId);
            var userdata = yield db.collection('User').find({user_id: userId}).toArray();
            var connectionType = connectionInstance.type;
            var connections = userdata[0].connections || {}
            var conn = connections[connectionType] ? connections[connectionType] : [];
            console.log("conn of type " + JSON.stringify(conn,null,2));
            var obj = {};
            if (connectionInstance.type == 'ftp' || connectionInstance.type == 'sftp' || connectionInstance.type == 'mysql') {
                if (connectionInstance.type == 'mysql') {
                    obj = _.find(conn, {
                        host: connectionInstance.host,
                        username: connectionInstance.username,
                        database: connectionInstance.database
                    });
                } else {
                    obj = _.find(conn, {host: connectionInstance.host});
                }

            } else {
                obj = _.find(conn, {type: connectionInstance.type, email: connectionInstance.email});
                console.log("emailllll " + connectionInstance.email);
            }

            if (obj) {
                //defer.resolve(obj);
                return obj;
            } else {
                // defer.reject("No connection found with the information provided.");
                return "No connection found with the given information."
            }
        } catch (e) {
            console.log("exception in getConnectionDetails " + e);
            return e;
        }
    })
}

function dataForTargetObject(data, relation) {
    for (var m = 0; m < data.length; m++) {
        if (data[m].success) {
            salesdata[m][relation] = data[m].id;
        }
    }
}


function insertIntoRelatedObjects(sfobj, data, connection) {
    var def = q.defer();
    console.log("obj in insertIntoRelatedObjects " + sfobj);
    console.log(("data in insertIntoRelatedObjects " + JSON.stringify(data, null, 2)))
    var records = [];
    for (var i = 0; i < data.length; i++) {
        records.push(data[i].records);
    }
    connection.sobject(sfobj).create(records, function (err, ret) {
        if (err) {
            console.log("err is --------------------------" + JSON.stringify(err, null, 2));
            // def.reject(err);
            def.resolve(err);
        } else {
            console.log("in " + sfobj + " inserted " + JSON.stringify(ret, null, 2));
            def.resolve(ret);
        }
    });
    return def.promise;
}

function validateRecord(record, fields, requiredSalesAttributes) {
    try {
        var result = {valid: true};
        var missingFields = [];
        var error = {}

        var keys = Object.keys(record);
        for (var j = 0; j < requiredSalesAttributes.length; j++) {
            if (keys.indexOf(requiredSalesAttributes[j]) == -1) {
                missingFields.push(requiredSalesAttributes[j]);
            }
        }
        if (missingFields.length > 0) {
            result.valid = false;
            // record.error =  {RequiredField: 'Required Fields are missing ' + missingFields }
            error['RequiredField'] = 'Required Fields are missing ' + missingFields
        }
        var primitiveTypes = config.primitiveTypes;
        for (var i = 0; i < keys.length; i++) {
            var obj = {}
            var recordValue = record[keys[i]];
            var field = _.find(fields, {name: keys[i]})

            if (primitiveTypes.indexOf(field.type) != -1) {
                if (!__.isNumber(recordValue)) {
                    result.valid = false;
                    obj[keys[i]] = "Field type mismatch, expected " + field.type
                    error['type'] = obj;
                }
            }
        }
        if (Object.keys(error).length > 0) {
            record.error = error;
        }
        result.record = record;
        return result;

    } catch (e) {
        console.log("err in validateRecord " + e);
    }

}

function updateUserInfo(userId, query) {
    var defer = q.defer();
    var db = database.getDB();
    db.collection('User').update({user_id: {$eq: userId}}, query, {upsert: true}, function (error, count, result) {
        if (error) {
            console.log(error);
            defer.reject(error);
        } else {
            defer.resolve(true);
        }
    });
    return defer.promise;
}

function createTask(userId, type, mappingObj) {
    var defer = q.defer();
    var db = database.getDB();
    var task = {
        userId: userId,
        type: type,
        mapping: mappingObj
    }
    db.collection('Task').insert(task, function (err, taskobj) {
        if (err) {
            defer.resolve(err);
        } else {
            console.log("task created in database " + JSON.stringify(taskobj, null, 2));
            defer.resolve(taskobj);
        }
    });
    return defer.promise;
}
function updateTask(id, mappingObj) {
    var defer = q.defer();
    var db = database.getDB();
    delete mappingObj._id;
    /* var task = {
     userId: userId,
     type: type,
     mapping: mappingObj
     }*/
    db.collection('Task').update({_id: {$eq: id}}, mappingObj, {upsert: true}, function (err, taskobj) {
        if (err) {
            defer.resolve(err);
        } else {
            console.log("task created in database " + JSON.stringify(taskobj, null, 2));
            defer.resolve(taskobj);
        }
    });
    return defer.promise;
}

function deleteTask(userId, recordId) {
    return co(function* () {
        try {
            var db = database.getDB();
            var data = {};
            //var recordId = new ObjectID(id);
            console.log('inside delete task id ' + recordId);
            /*
             yield db.collection('Task', function(err, collection) {
             collection.deleteOne({_id: new ObjectID(recordId)});

             console.log('delete one lists: '+recordId);
             });*/


            yield db.collection('Task').remove({_id: new ObjectID(recordId)});


            data = yield listAllTAsk({userId: userId});
            console.log('task lists: ' + data);
            return data;
        } catch (e) {
            return e;
        }

    })

}


function currentUserInfo(userId) {
    var db = database.getDB();
    var defer = q.defer();
    console.log("user_id is " + userId);
    db.collection('User').find({"user_id": userId}).toArray(function (err, data) {
        if (err) {
            defer.reject(false);
        } else {
            defer.resolve(data[0]);
        }
    })
    return defer.promise;
}


function createTask(userId, task) {
    return co(function* () {
        try {
            var db = database.getDB();
            var data = yield db.collection('Task').insert(task);
            console.log("inserted into task " + JSON.stringify(data, null, 2));
            return data;
        } catch (e) {
            return e;
        }
    })
}


function processExport(obj, connection, soql) {

    var jsonparser = require('jsonparsertool/lib');
    var records = []
    var dataForJsonParser = [];
    connection.query(soql, function (err, result) {
        if (err) {
            res.status(400).send(err.message);
        } else {
            var attributeobj = obj.export[obj.export.length - 1].mapping.attributes;
            console.log("attributeobj is " + JSON.stringify(attributeobj, null, 2));
            records = result.records;
            for (var i = 0; i < records.length; i++) {
                delete records[i].attributes;
            }

            console.log("records are " + JSON.stringify(records, null, 2));

            csv.transform(records, function (data) {
                try {
                    console.log("-----------------------------------", data)
                    dataForJsonParser.push(data);
                    console.log("dataForJsonParser is " + JSON.stringify(dataForJsonParser, null, 2));
                    /*console.log("@@@@@@@@@@@@@@@@@",attributeobj[key]);
                     console.log("xpath check " + attributeobj[key].xpath);*/
                    for (var key in attributeobj) {
                        console.log("attributeobj...." + JSON.stringify(attributeobj, null, 2));
                        console.log("key is " + JSON.stringify(attributeobj[key]));

                        if (attributeobj[key]['xpath']) {
                            val = jsonparser.evaluate(dataForJsonParser, attributeobj[key].xpath, false, true);
                            console.log("----------" + attributeobj[key]['xpath'], val);

                            data[attributeobj[key].salesAttribute] = val[0];
                        } else {
                            console.log("else")
                        }

                    }
                    dataForJsonParser = [];
                    //formattedData.push(data);
                    return data;
                    console.log("formatted " + JSON.stringify(formattedData, null, 2));

                } catch (e) {
                    console.log("exception is " + e);
                }
            }, function (err, data1) {
                console.log(data1)
                csv.stringify(data1, function (err, data) {
                    console.log("******************************************")
                    console.log(data);
                    fs.writeFile(obj.export[obj.export.length - 1].name + ".csv", data, function (err) {
                        if (err) {
                            return console.log(err);
                        }
                        console.log("The file was saved!");
                        res.status(200).send({status: true, msg: "file created"});

                    });
                    //process.stdout.write(data);
                });
            })
        }

    })
}

function insert(userId, dataArray, salesdata, objType, connection) {
    return co(function* () {
        var requiredSalesAttributes = []
        var StandardSalesForceFields = config.StandardSalesForceFields;
        var successRecords = [];
        var errorRecords = [];
        var validRecords = [];
        // var invalidRecords = [];
        var validRecordsIndexes = [];
        var fields = yield salesObjectAttributes(userId, objType.obj);

        var currentIndex = 0;
        requiredSalesAttributes = [];
        for (var j = 0; j < fields.length; j++) {
            if (fields[j].nillable == false && StandardSalesForceFields.indexOf(fields[j].name) == -1) {
                requiredSalesAttributes.push(fields[j].name);
            }
        }
        // console.log("required sales attribute " + requiredSalesAttributes);
        while (currentIndex < dataArray.length) {
            console.log("current index is @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@" + currentIndex);
            validRecords = [];
            validRecordsIndexes = [];
            for (var k = currentIndex; k < dataArray.length && validRecords.length < config.recordBatchSize; k++) {
                var result = validateRecord(dataArray[k], fields, requiredSalesAttributes);
                console.log("validation result is " + JSON.stringify(result, null, 2));
                if (result.valid) {
                    validRecords.push({index: k, records: result.record});
                    validRecordsIndexes.push(k);
                    //validRecords.push({ records: result.record});
                } else {
                    errorRecords.push(result.record);
                }
                currentIndex = k + 1;
            }
            try {
                if (validRecords.length > 0) {
                    // console.log("valid records for insertion " + JSON.stringify(validRecords, null, 2))
                    var insertedRecords = yield insertIntoRelatedObjects(objType.obj, validRecords, connection);
                    console.log("insertedRecords is " + JSON.stringify(insertedRecords, null, 2));
                    // console.log("validRecordsIndexes " + validRecordsIndexes);
                    console.log("relation is " + objType.relation);
                    for (var j = 0; j < validRecords.length; j++) {
                        if (insertedRecords[j] && insertedRecords[j].success) {
                            validRecords[j]['records']['id'] = insertedRecords[j].id;
                            if (objType.type == 'related') {
                                for (var i = 0; i < insertedRecords.length; i++) {
                                    for (var k = 0; k < validRecordsIndexes.length; k++) {
                                        var index = validRecordsIndexes[k];
                                        var data = salesdata[index];
                                        data[objType.relation] = insertedRecords[i].id
                                    }
                                }
                            }
                            successRecords.push(validRecords[j]['records']);
                        } else {
                            console.log("error " + insertedRecords.errorCode + insertedRecords.fields);
                            validRecords[j]['records']['error'] = insertedRecords.errorCode + insertedRecords.fields;
                            errorRecords.push(validRecords[j]['records']);
                        }
                    }


                    console.log("after relatedobject salesdata is " + JSON.stringify(salesdata, null, 2));
                }

            } catch (e) {
                console.log("relatedData exception is " + e);
            }
        }
        return {successRecords: successRecords, errorRecords: errorRecords}
    })

}
module.exports = router;
