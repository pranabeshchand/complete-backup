/**
 * Created by aasheesh on 7/5/17.
 */

var q = require('q');
var config = require('./../config/config');
var fs = require('fs');
var CsvReader = require('csv-reader');
var jsonparser = require('jsonparsertool/lib');
var co = require('co');
var moment = require('moment');
var database = require('./../config/db');
var sales = require('node-salesforce');
var _ = require('lodash');
var __ = require('underscore');
var requestPromise = require('request-promise-native');
var JSFtp = require("jsftp");
var Client = require('ssh2-sftp-client');


var mapping = {
    generateObjectAndKeysFromMapping: function (mappingAttributes) {
        var ObjectAndKeys = {};
        for (var key in mappingAttributes) {
            var keyname = key.split('.');
            if (keyname.length == 1) {
                simpleKeys.push(key);
            } else {
                var relatedObject = mappingAttributes[key].referenceTo;
                var value = ObjectAndKeys[relatedObject];
                if (ObjectAndKeys[relatedObject]) {
                    value.push(keyname[1]);
                } else {
                    ObjectAndKeys[relatedObject] = [keyname[1]];
                }
            }
        }
        ObjectAndKeys[salesObject] = simpleKeys;
        return ObjectAndKeys;
    },

    mappingKeysValidation: function (userId, obj) {
        var defer = q.defer();
        var missingAttributesObject = {};
        var promises = [];
        var requiredSalesAttributes = []
        var StandardSalesForceFields = config.StandardSalesForceFields;
        var salesObjects = [];
        for (var sobject in obj) {
            salesObjects.push(sobject);

            promises.push(mapping.salesObjectAttributes(userId, sobject));
        }
        q.all(promises).then(function (data) {

            for (var i = 0; i < data.length; i++) {
                var mappingKeys = obj[salesObjects[i]]
                var missingKeys = [];
                var totalFields = data[i].length;
                for (var j = 0; j < totalFields; j++) {
                    if (data[i][j].nillable == false && StandardSalesForceFields.indexOf(data[i][j] == -1)) {
                        requiredSalesAttributes.push(data[i][j].name);
                    }
                }
                for (var j = 0; j < requiredSalesAttributes.length; j++) {
                    if (mappingKeys.indexOf(requiredSalesAttributes[i]) == -1) {
                        missingKeys.push(requiredSalesAttributes[i]);
                    }
                }
                if (missingKeys.length > 0) {
                    missingAttributesObject[salesObjects[i]] = missingKeys;
                }
            }
            if (Object.keys(missingAttributesObject).length == 0) {
                defer.resolve({requiredValidation: true});
            } else {
                defer.resolve({requiredValidation: false, data: missingAttributesObject});
            }
        }, function (err) {
            defer.reject(err);
        })
        return defer.promise;

    },

    processCSV: function (mappingobj, connection, userId) {
        //var defer = q.defer();
        return co(function*() {
            try {
                var jsondata = [];
                var relatedJsonData = [];

                var count = 1;

                var salesdata = [];
                var salesRelationData = []

                var targetSalesObject = mappingobj.mapping.object;

                var attributeobj = mappingobj.mapping.attributes;
                console.log("attributeobj is " + JSON.stringify(attributeobj, null, 2));

                if (mappingobj.fileDetails.connection.type == 'MyComputer') {
                    var inputStream = fs.createReadStream(__dirname + '/' + mappingobj.fileDetails.file_path, 'utf8');
                } else {
                    var conn = yield mapping.getConnectionDetails(userId, mappingobj.fileDetails.connection);
                    var cloudFileData = yield mapping.readCloudFile(conn, mappingobj.fileDetails.file_path, false);
                    var fileName = mappingobj.name + '-' + moment().format('YYYY-MM-DD HH.mm.ss');
                    fs.writeFileSync(fileName, cloudFileData);
                    inputStream = fs.createReadStream(fileName, 'utf8');
                }

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

                        co(function* () {
                            try {
                                var successRecords = [];
                                var errorRecords = [];
                                for (var relatedObjName in salesRelationData[0]) {

                                    var relationName = Object.keys(salesRelationData[0][relatedObjName])[0];
                                    var relation = (relationName.replace('__r', '__c'));
                                    var dataArray = salesRelationData[0][relatedObjName][relationName];
                                    var result = yield mapping.insert(userId, dataArray, salesdata, {
                                        type: 'related',
                                        obj: relatedObjName,
                                        relation: relation
                                    }, connection);
                                    successRecords = successRecords.concat(result.successRecords);
                                    errorRecords = errorRecords.concat(result.errorRecords);
                                }
                                var obj = {type: 'simple', obj: targetSalesObject}
                                console.log("salesdata passed to simple insert " + JSON.stringify(salesdata, null, 2));
                                var result = yield mapping.insert(userId, salesdata, salesdata, obj, connection);
                                successRecords = successRecords.concat(result.successRecords);
                                errorRecords = errorRecords.concat(result.errorRecords);
                                if (successRecords.length > 0) {
                                    fs.writeFileSync('success-' + mappingobj.name + '-' + moment().format('YYYY-MM-DD HH.mm.ss'), JSON.stringify(successRecords, null, 2));
                                }
                                if (errorRecords.length > 0) {
                                    fs.writeFileSync('error-' + mappingobj.name + '-' + moment().format('YYYY-MM-DD HH.mm.ss'), JSON.stringify(errorRecords, null, 2));
                                }
                                //defer.resolve(true);
                                return true;
                            } catch (e) {
                                console.log("exception overall " + e);
                                return e;
                                //defer.reject(e);
                            }
                        })
                    });
            } catch (e) {
                return e;
            }

        })
    },

    getConnectionDetails: function (userId, connectionInstance) {
        return co(function*() {
            try {
                var db = database.getDB();
                console.log("userId in getConnectionDetails " + userId);
                var userdata = yield db.collection('User').find({user_id: userId}).toArray();
                var connectionType = connectionInstance.type;
                var connections = userdata[0].connections || {}
                var conn = connections[connectionType] ? connections[connectionType] : [];
                console.log("conn of type " + JSON.stringify(conn, null, 2));
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
    },
    readCloudFile: function (connection, filepath, onlyHeader) {
        return co(function*() {
            try {
                if (connection.type == 'dropbox') {
                    var url = 'https://content.dropboxapi.com/1/files/auto' + filepath + '?access_token=' + connection.access_token;
                } else if (connection.type == 'box') {
                    url = 'https://api.box.com/2.0/files/' + filepath + '/content?access_token=' + connection.access_token;
                } else if (connection.type == 'google_drive') {
                    url = 'https://www.googleapis.com/drive/v3/files/' + filepath + '?access_token=' + connection.access_token + '&alt=media'
                } else {
                    url = '';
                }

                if (url == '') {
                    return mapping.remotefile(connection, filepath);
                } else {
                    return requestPromise.get(url);
                }
            } catch (e) {
                console.log("exception in readCloudFile is " + e);
                return e;
            }
        })
    },
    chunkToUTF8: function (data) {
        var textChunk = data.toString('utf8');
        textChunk = textChunk.split(/\r\n|\n/);
        var csvheader = textChunk[0].split(',');
        console.log("csvheader in chunkToUTF8 " + csvheader);
        return csvheader;
    },
    remotefile: function (connection, path) {
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
                            console.log(str);
                            defer.resolve(str);
                        });

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
    },

    processExport: function (obj, connection, soql) {

        var records = []
        var dataForJsonParser = [];
        connection.query(soql, function (err, result) {
            if (err) {
                res.status(400).send(err.message);
            } else {
                var attributeobj = obj.mapping.attributes;
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
    },
    insert: function (userId, dataArray, salesdata, objType, connection) {
        return co(function* () {
            var requiredSalesAttributes = []
            var StandardSalesForceFields = config.StandardSalesForceFields;
            var successRecords = [];
            var errorRecords = [];
            var validRecords = [];
            // var invalidRecords = [];
            var validRecordsIndexes = [];
            var fields = yield mapping.salesObjectAttributes(userId, objType.obj);

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
                    var result = mapping.validateRecord(dataArray[k], fields, requiredSalesAttributes);
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
                        var insertedRecords = yield mapping.insertIntoRelatedObjects(objType.obj, validRecords, connection);
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

    },
    salesforceInstance: function (userId) {
        var defer = q.defer();
        try {
            var sfobj = {
                oauth2: config.SalesForce
            }

            // var db = database.getDB();
            // var data = yield db.collection('User').find({user_id: userId}).toArray();
            //console.log("data is " + JSON.stringify(data[0], null, 2));
            mapping.sfLoginWithCredentials(userId).then(function (data) {
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
           // return e;
            defer.reject(e);
        }
        return defer.promise;
    },

     sfLoginWithCredentials: function(userId) {
    var defer = q.defer();
    var conn = new sales.Connection({});

    mapping.currentUserInfo(userId).then(function (userdetails) {
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
},
     currentUserInfo: function(userId) {
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
},
    salesObjectAttributes: function (userId, objectName) {
        var defer = q.defer();
        mapping.salesforceInstance(userId).then(function (sfconnection) {
            sfconnection.sobject(objectName).describe$(function (err, meta) {
                if (err) {
                    console.log("err in salesObjectAttributes " + err);
                    defer.reject(err);
                } else {
                    defer.resolve(meta.fields);
                }
            });
        }, function (err) {
            defer.reject(err);
        })
        return defer.promise;
    },
    validateRecord: function (record, fields, requiredSalesAttributes) {
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

    },
    insertIntoRelatedObjects: function (sfobj, data, connection) {
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
    },

    processExport: function (obj, connection, soql) {

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
}

module.exports = mapping;

console.log(Object.keys(mapping).length);
