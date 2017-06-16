/**
 * Created by aasheesh on 15/5/17.
 */
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
var CircularJson = require('circular-json');
var JSFtp = require("jsftp");
var CsvReader = require('csv-reader');
var jsonparser = require('jsonparsertool/lib');
var ObjectID = require('objectid');
var parseString = require('xml2js').parseString;
var moment = require('moment');

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
            console.log("mappingobj is " + JSON.stringify(mappingobj, null, 2));
            if (mappingobj.type == 'import') {
                task = 'import';
            } else {
                task = 'export'
            }
            var salesObject = mappingobj.mapping.object;

            if (task == 'import') {
                var mappingAttributes = mappingobj.mapping.attributes;
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
                }
            } else {
                var data = yield createTask(userId, mappingobj);
                var sfconnection = yield salesforceInstance(userId);
                yield processCSV(mappingobj, sfconnection);
            }
        } catch (e) {
            console.log("exception is " + e);
            res.status(400).send({err: err});
        }

    })

});

router.get('/sflogin', function (req, res, next) {
    console.log("api called....");
    var conn = new sales.OAuth2(config.salesForceConfig);
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

    var oauth2 = new sales.OAuth2(config.salesForceConfig);
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
    var obj;
    if (req.query.file_path) {
        obj = JSON.parse(req.query.file_path);
    }
    var filepath = obj.file_path;
    var connectionType = obj.connection.type;
    var url = '';

    console.log("obj is " + JSON.stringify(obj, null, 2));
    var db = database.getDB();
    db.collection('User').find({user_id: req.session.userId}).toArray(function (err, data) {
        if (err) {
            res.status(400).send({error: err});
        } else {
            if (connectionType == 'ftp' || connectionType == 'sftp') {
                connection = _.find(data[0].connections[connectionType], {host: obj.connection.host});
            } else {
                connection = _.find(data[0].connections[connectionType], {
                    email: obj.connection.email,
                    type: obj.connection.type
                });
            }

            if (connectionType == 'dropbox') {
                url = 'https://content.dropboxapi.com/1/files/auto' + filepath + '?access_token=' + connection.access_token;
            } else if (connectionType == 'box') {
                url = 'https://api.box.com/2.0/files/' + filepath + '/content?access_token=' + connection.access_token;
            } else if (connectionType == 'google_drive') {
                url = 'https://www.googleapis.com/drive/v3/files/' + filepath + '?access_token=' + connection.access_token + '&alt=media'
            } else {
                url = '';
            }

            if (url == '') {
                remotefile(connection, filepath).then(function (data) {
                    res.status(200).send({data: data});
                }, function (err) {
                    res.status(400).send({err: err});
                })
            } else {
                request.get(url, function (err, response, body) {
                    if (err) {
                        res.status(400).send({err: err});
                    } else {
                        var textChunk = body.toString('utf8');
                        textChunk = textChunk.split(/\r\n|\n/);
                        var csvheader = textChunk[0].split(',');
                        console.log("csvheader is " + csvheader);
                        res.status(200).send({"status": true, "csvHeader": csvheader, "fileName": obj.file_path});

                    }
                })
            }


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
        console.log("access token is " + access_token);
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

function remotefile(connection, path) {
    var defer = q.defer();
    if (connection.type == 'ftp') {
        var Ftp = new JSFtp({
            host: connection.host,
            port: connection.port,
            user: connection.username,
            pass: connection.password
        });
        var str = ""
        Ftp.get(path, function (err, socket) {
            if (err) {
                defer.reject(err);
            } else {
                try {
                    socket.on("data", function (d) {
                        str += d.toString();
                        console.log("---------------")
                        console.log(str)
                    });
                    defer.resolve(str);
                    socket.on("close", function (hadErr) {
                        if (hadErr)
                            console.error('There was an error retrieving the file.');
                    });
                    socket.resume();
                } catch (e) {
                    console.log("file get exception " + e);
                    res.status(400).send({err: e});
                }

            }
        });
    } else {
        var data = '';
        var sftp = new Client();
        sftp.connect({
            host: connection.host,
            port: connection.port,
            username: connection.username,
            password: connection.password
        }).then(() => {
            return sftp.get(path);
        }).then((readable) => {
            readable.on('data', (chunk) => {
                data = data + chunk;
                console.log("chunk length " + chunk);
            });
            readable.on('end', () => {
                console.log('There will be no more data.');
                defer.resolve(data);
            });
        }).catch((err) => {
            console.log(err, 'catch error');
        });
    }
    return defer.promise;
}


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

                var connectionInstance = {type: 'box', email: JSON.parse(data).login, access_token: body.access_token}
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

function driveFilesFolders(token, path) {
    var defer = q.defer();
    var options = {
        method: "GET",
        url: "https://www.googleapis.com/drive/v3/files?q='" + path + "' in parents &access_token=" + token
    }
    console.log("options are " + options.url);
    request(options, function (err, response, body) {
        if (err) {
            defer.reject(err);
        } else {
            console.log("body is " + body);
            var files = JSON.parse(body).files;
            for (var i = 0; i < files.length; i++) {
                if (files[i].mimeType == 'application/vnd.google-apps.folder') {
                    files[i].is_dir = true;
                } else {
                    files[i].is_dir = false;
                }
            }
            defer.resolve(files);
        }
    })
    return defer.promise;
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
                driveFilesFolders(connectionobj.access_token, path || 'root').then(function (data) {
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
    request(options, function (err, response, body) {
        if (err) {
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
                    fs.writeFile('ftp.json', JSON.stringify(data, null, 2), function (err) {
                        if (err) return console.log(err);
                        console.log('Hello World > helloworld.txt');
                    });
                    defer.resolve(data);

                }

            });
        } catch (e) {
            console.log("exception ftp " + e);
            defer.reject(err);
        }

    } else {
        var Client = require('ssh2-sftp-client');
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
            console.log("recordId is " + recordId);
            var tasks = yield deleteTask(req.session.userId, recordId);
            res.status(200).send({status: true, tasks: tasks});
        } catch (e) {
            console.log
            res.status(400).send({status: false, err: JSON.stringify(e)});
        }

    })
})

function listAllTAsk(query) {
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

function salesforceInstance(userId) {
    return co(function* () {
        try {
            var sfobj = {
                oauth2: config.salesForceConfig,
            }

            var db = database.getDB();
            var data = yield db.collection('User').find({user_id: userId}).toArray();
            console.log("data is " + JSON.stringify(data[0], null, 2));
            sfobj.instanceUrl = data[0].instanceUrl;
            sfobj.accessToken = data[0].accessToken;
            sfobj.refreshToken = data[0].refreshToken;

            return (new sales.Connection(sfobj));

        } catch (e) {
            console.log("exception in sfinstance " + e);
            return e;
        }
    })
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
            if (connectionInstance.type == 'ftp' || connectionInstance.type == 'sftp') {
                obj = _.find(conn, {host: connectionInstance.host});
            } else {
                obj = _.find(conn, {type: connectionInstance.type, email: connectionInstance.email});
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

function processCSV(mappingobj, connection, sobjects, fieldArray) {
    var defer = q.defer();
    var jsondata = [];
    var relatedJsonData = [];
    var inputStream = fs.createReadStream(__dirname + '/' + mappingobj.fileName, 'utf8');
    var count = 1;

    var salesdata = [];
    var salesRelationData = []
    var successRecords = []
    var errorRecords = [];

    var targetSalesObject = mappingobj.mapping.object;

    var attributeobj = mappingobj.mapping.attributes;
    console.log("attributeobj is " + JSON.stringify(attributeobj, null, 2));

    inputStream
        .pipe(CsvReader({parseNumbers: true, parseBooleans: true, trim: true}))
        .on('data', function (row) {

            if (count == 1) {
                keys = row;
                count++;
            } else {
                jsondata = [];
                relatedJsonData = [];
                var length = row.length;
                var simplekeyobj = {};
                var relationkeyobj = {}
                var relationKeys = [];
                for (var i = 0; i < length; i++) {
                    relationKeys = keys[i].split('.');
                    if (relationKeys.length > 1) {
                        relationkeyobj[keys[i]] = row[i];
                    } else {
                        simplekeyobj[keys[i]] = row[i];
                    }

                }
                jsondata.push(simplekeyobj);
                relatedJsonData.push(relationkeyobj);
                console.log("jsondata is " + JSON.stringify(jsondata, null, 2))
                var sobj = {}
                var srelatedobj = {};

                for (var key in attributeobj) {
                    var ob = {}
                    relateddata = [];
                    var type = 'simple';
                    console.log("key is " + key);

                    var obj = attributeobj[key];
                    for (var keyname in obj) {
                        if (typeof obj[keyname] == 'object') {
                            if (obj[keyname].xpath) {
                                val = jsonparser.evaluate(relatedJsonData, obj[keyname].xpath, false, true);
                                if (val) {
                                    ob[keyname] = val[0];
                                }
                            } else {
                                ob[keyname] = relatedJsonData[0][obj[keyname]['clientattribute']]
                            }
                            relateddata = [ob];
                            type = 'related'
                            relatedObj = obj[keyname]['referenceTo']
                        }
                    }

                    if (type == 'simple') {
                        if (attributeobj[key].xpath) {
                            val = jsonparser.evaluate(jsondata, attributeobj[key].xpath, false, true);
                            if (val) {
                                sobj[key] = val[0];
                            }
                        } else {
                            sobj[key] = jsondata[0][attributeobj[key].clientattribute];
                        }

                    } else {
                        var obj = {};
                        obj[key] = relateddata
                        srelatedobj[relatedObj] = obj;
                    }
                }
                console.log("srelatedobj  is " + JSON.stringify(srelatedobj, null, 2));
                salesdata.push(sobj);
                for (var key in srelatedobj) {
                    var mykey = Object.keys(srelatedobj[key])[0];
                    var arr = srelatedobj[key][mykey];
                    if (salesRelationData[0]) {
                        if (salesRelationData[0][key]) {
                            arr.unshift(salesRelationData[0][key][mykey][0])
                            salesRelationData[0][key][mykey] = arr;
                        } else {
                            salesRelationData[0][key] = srelatedobj[key];
                        }
                    } else {
                        salesRelationData[0] = {}
                        salesRelationData[0][key] = srelatedobj[key];
                    }
                }
            }
        })
        .on('end', function (data) {
            console.log("salesdata is " + JSON.stringify(salesdata, null, 2));
            console.log("salesRelationData is " + JSON.stringify(salesRelationData, null, 2));


            var promises = [];
            var RelationNames = [];
            // var access_token = connection.accessToken;


            for (var relatedObjName in salesRelationData[0]) {
                var relationName = Object.keys(salesRelationData[0][relatedObjName])[0];
                RelationNames.push(relationName.replace('__r', '__c'));
                promises.push(insertIntoRelatedObjects(relatedObjName, salesRelationData[0][relatedObjName][relationName]));
            }
            q.allSettled(promises).then(function (results) {
                // console.log("after resolve data is " + JSON.stringify(data, null, 2));
                results.forEach(function (result, index) {
                    var Relation = RelationNames[index];
                    dataForTargetObject(result, Relation);
                });
                console.log("salesdata before inserting " + JSON.stringify(salesdata, null, 2));
                try {
                    var records = recordsForSoap(salesdata, targetSalesObject);
                    // var access_token = '00D28000001EkAz!AQwAQJ61bNJRz0ruFJLIxzFuMIaVXhhQrI_0yWzRy4FDXtr2MWsJdwjXywzAA41HfmKVLtPvG02UbPeBAdN8vWK4qWdnz44D';;
                    insertRecords(targetSalesObject, records, access_token).then(function (result) {
                        console.log("result targetsales " + JSON.stringify(result, null, 2));
                        parseString(result.body, function (err, result) {
                            var output = result['soapenv:Envelope']['soapenv:Body'][0]['createResponse'][0].result;
                            for (var i = 0; i < output.length; i++) {
                                if (output[i].success[0] == 'true') {
                                    successRecords.push(salesdata[i]);
                                } else {
                                    salesdata[i].error = output[i].errors[0].message
                                    errorRecords.push(salesdata[i]);
                                }
                            }
                            console.log("successRecords " + successRecords.length);
                            console.log("errorRecords " + errorRecords.length);
                            fs.writeFileSync('success-' + mappingobj.name + moment().format('YYYY-MM-DD HH.mm.ss'), JSON.stringify(successRecords, null, 2));
                            fs.writeFileSync('error-' + mappingobj.name + moment().format('YYYY-MM-DD HH.mm.ss'), JSON.stringify(errorRecords, null, 2));
                        })

                    })
                } catch (e) {
                    console.log("exception in insert " + e);
                }


            }, function (err) {
                //res.status(400).send({status: false})
                defer.reject(err);
            })

            function dataForTargetObject(result, relation) {
                console.log("result is " + JSON.stringify(result, null, 2));
                if (result.state === "fulfilled") {
                    parseString(result.value.body, function (err, result) {
                        var output = result['soapenv:Envelope']['soapenv:Body'][0]['createResponse'][0].result;
                        for (var i = 0; i < output.length; i++) {
                            if (output[i].success[0] == 'true') {
                                salesdata[i][relation] = output[i].id[0];
                            } else {
                                // salesdata[i].error = output[i].errors[0].message
                                // errorRecords.push(salesdata[i]);
                            }
                        }
                        console.log("JSON formatted output " + JSON.stringify(result['soapenv:Envelope']['soapenv:Body'][0]['createResponse'][0].result));
                    })
                } else {

                }
            }

            function insertIntoSalesObject(data) {
                connection.sobject(targetSalesObject).create(data, function (err, ret) {
                    if (err) {
                        defer.reject(err);
                    } else {
                        console.log("after insert salesdata " + JSON.stringify(ret, null, 2));
                        defer.resolve(salesdata);
                    }
                });
                return defer.promise;
            }

            function insertIntoRelatedObjects(sfobj, data) {
                console.log("obj in insertIntoRelatedObjects " + sfobj);
                console.log(("data in insertIntoRelatedObjects " + JSON.stringify(data, null, 2)))
                if (data.username__c) {
                    delete data.username__c;
                }
                if (data.first_name__c) {
                    delete data.first_name__c;
                }

                console.log()
                var records = recordsForSoap(data, sfobj);
                // var access_token = '00D28000001EkAz!AQwAQJ61bNJRz0ruFJLIxzFuMIaVXhhQrI_0yWzRy4FDXtr2MWsJdwjXywzAA41HfmKVLtPvG02UbPeBAdN8vWK4qWdnz44D';
                return insertRecords(sfobj, records, access_token);
            }

        });
    return defer.promise;
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

function deleteTask(userId, recordId) {
    return co(function* () {
        try {
            var db = database.getDB();
            var recordId = new ObjectID(id);
            yield db.collection('Task').remove({_id: recordId});
            var data = yield listAllTAsk({userId: userId});
            return data;
        } catch (e) {
            return e;
        }

    })

}

/*function deleteTask(userId, type, mappingObj) {
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
 }*/

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

function recordsForSoap(data, sobject) {
    var records = [];
    for (var i = 0; i < data.length; i++) {
        var startTag = '<urn:sObjects xsi:type="urn1:' + sobject + '">'
        var endTag = '</urn:sObjects>'
        var str = '';
        for (var key in data[i]) {
            str = str + '<' + key + '>' + data[i][key] + '</' + key + '>'
        }
        records.push(startTag + str + endTag);

    }
    return records.join('');
}

function insertRecords(sobject, records, access_token) {
    var defer = q.defer();
    try {
        var url = 'https://ap2.salesforce.com/services/Soap/data/v29.0/sobjects';

        var body = ['<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:enterprise.soap.sforce.com" xmlns:urn1="urn:sobject.enterprise.soap.sforce.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">',

            '<soapenv:Header>',

            '<urn:SessionHeader>',

            '<urn:sessionId>' + access_token + '</urn:sessionId>',

            '</urn:SessionHeader>',

            '</soapenv:Header>',

            '<soapenv:Body>',
            '<urn:create>',
            records,
            '</urn:create>',

            '</soapenv:Body>',

            '</soapenv:Envelope>',

        ].join(' ');

        var options = {
            url: url,
            method: 'POST',
            headers: {
                "Authorization": "Bearer" + access_token,
                "Content-Type": "text/xml",
                "SOAPAction": '""'
            },
            body: body

        }
        request(options, function (err, response, body) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(response);
            }
        })
    } catch (e) {
        defer, reject(e);
    }
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

module.exports = router;
