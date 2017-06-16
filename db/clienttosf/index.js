var mdm = require('./../mongomdm');
var mapper = require('./../mapper');
var circular = require('circular');
var Q = require('q');
var jsonparser = require('./../jsonparser');
var sf = require('./../salesforce');
var _ = require('lodash');
var log = require('./../log');
var ObjectID = require('mongodb').ObjectID;

var self = {

    jobStatus: null,

    mongosf: function (config, mdm) {
        var d = Q.defer();
        try {

            self.jobStatus = 'I'
            var promises = [];
            var teampCache = {};
            var sobjects = {};
            var mapping = mapper.getMapping(false);

            // mdm.init(config).then(function (res) {
            mdm.getDocumnets(mdm.mimdb, config.mim.syncTable, false, false, function (res) {
                for (var i = 0; i < mapping.mongoCollections.length; i++) {
                    var p = _fillTempCache(mapping.mongoCollections[i], res);
                    promises.push(p);
                }
                Q.all(promises).then(function (ou) {
                    //Collected all documents from all collection which are updates/inserted after lastsync
                    log.info('teampCache :' + JSON.stringify(teampCache));
                    // Classify TempCache to Insert and update  per collection
                    sobjects = self.createSfobjects(teampCache, mapping);
                    log.info('sobjects ' + JSON.stringify(sobjects));
                    //{"Account":{"insert":[{"type":"Account","id":"0012800000btRkpAAE","Name":"HimanshuA"},{"type":"Account","Name":"Montu"}],"update":[]}};
                    //self.processRecords(sobjects)
                    d.resolve(sobjects);
                });
            })
            //});

            function _fillTempCache(d, r) {
                var def = Q.defer();
                try {
                    mdm.getDocumnets(mdm.db, d, {latestBy: {$gt: r[0].lastSyncTime}}, false, function (result) {
                        teampCache[d] = result;
                        def.resolve(result);
                    })
                } catch (e) {
                    log.info(e);
                    def.reject(e);
                } finally {
                    return def.promise;
                }
            }


        } catch (e) {
            d.reject(e);
        } finally {
            return d.promise;
        }

    },

    createSfobjects: function (tcache, map) {

        try {
            var sobjects = {};
            for (var j = 0; j < map.entities.length; j++) {
                var temp = tcache[map.entities[j].type];
                if (!sobjects[map.entities[j].destType]) {
                    sobjects[map.entities[j].destType] = {insert: [], update: []};
                }
                if (temp.length == 0) {
                    continue;
                } else {
                    for (var k = 0; k < temp.length; k++) {
                        var destType = map.entities[j].destType;
                        var attributes = map.entities[j].attributes;
                        var op = convertJSONParser(destType, attributes, temp[k]);
                        if (!temp[k].salesId || temp[k].salesId == null) {
                            //sobjects[map.entities[j].destType].insert.push(op);
                            // parentDestType == destType means many to one from mongo to sales
                            if (map.entities[j].destType == map.entities[j].parentDestType) {
                                var fi = _.findIndex(sobjects[map.entities[j].parentDestType].insert, ["__mongoId", op.__mongoPrntId]);
                                if (fi > -1) {
                                    // if i m here then two models have same target destenation type , i have already target object collection,
                                    // also i foubnd matching parenmt of child
                                    //sobjects[map.entities[j].destType].update[0].merge(op);
                                    _.merge(sobjects[map.entities[j].destType].insert[fi], op);
                                } else { // either one to one or one to many mongosales
                                    sobjects[map.entities[j].destType].insert.push(op);
                                }
                            } else { // either one to one or one to many mongosales
                                sobjects[map.entities[j].destType].insert.push(op);
                            }
                        } else {
                            //update case
                            // parentDestType == destType means many to one from mongo to sales
                            if (map.entities[j].destType == map.entities[j].parentDestType) {
                                var fi = _.findIndex(sobjects[map.entities[j].destType].update, ["__mongoId", op.__mongoPrntId]);
                                if (fi > -1) {
                                    // if i m here then two models have same target destenation type , i have already target object collection,
                                    // also i foubnd matching parenmt of child
                                    //sobjects[map.entities[j].destType].update[0].merge(op);
                                    _.merge(sobjects[map.entities[j].destType].update[fi], op)
                                } else {
                                    sobjects[map.entities[j].destType].update.push(op)
                                }
                            } else {
                                sobjects[map.entities[j].destType].update.push(op)
                            }
                        }

                    }
                }
            }

            return sobjects;

            function convertJSONParser(dtype, atr, obj) {
                var tem = {};
                for (var key in atr) {
                    if (!atr.hasOwnProperty(key)) {
                        //The current property is not a direct property of p
                        continue;
                    }
                    //Do your logic with the property here
                    if (atr[key].indexOf('@') == 0 && atr[key].lastIndexOf('@') == (atr[key].length - 1)) {
                        var str = atr[key].substring(1, atr[key].length - 1);
                        tem[key] = str;

                    } else {

                        var m = jsonparser.evaluate(obj, atr[key]);
                        if (m.length == 0) {
                            // tem[key] =  null;
                        } else {
                            tem[key] = m[0].match;
                        }
                    }
                }
                log.info('tem' + tem)
                return tem;

            }
        } catch (e) {
            log.info(e);
        } finally {
            log.info('Created sfobjects')
        }


    },

    processRecords: function (sobjects, sf) {

        var d = Q.defer();
        var promices = [];
        try {
            for (var key in sobjects) {
                if (!sobjects.hasOwnProperty(key)) {
                    //The current property is not a direct property of p
                    continue;
                }
                //Do your logic with the property here
                //var p = sf.init(config.salesforce); initialization at the place of calling
                if (sobjects[key].insert.length != 0) {
                    for (var r = 0; r < sobjects[key].insert.length; r++) {
                        //var p =  sf.upsertObjects([key.insert[r]]);
                        var p = insertsf([sobjects[key].insert[r]]);
                        promices.push(p);
                    }
                } else if (sobjects[key].update.length != 0) {
                    var p = sf.upsertObjects(sobjects[key].update);
                    promices.push(p);
                }


            }

            Q.all(promices).then(function (result) {
                log.info("mongosf  insert/update completed");
                self.jobStatus = 'C';
                d.resolve(true);
            }, function (error) {
                log.info("error " + error);
                self.jobStatus = 'F';
                d.reject(true);
            })

            function insertsf(sobj) {
                try {
                    var def = Q.defer();
                    var mongoType = sobj[0].__mongoType;
                    var nestedMongoType = sobj[0].__nestedMongoType;
                    var mongoId = sobj[0].__mongoId;
                    var nestedMongoPrntId = sobj[0].__nestedMongoPrntId;
                    var t = sf.upsertObjects(sobj);
                    t.then(function (result) {
                        //var d = [{type: mongoType, id: mongoId, salesId: result[0].id}]
                        if (nestedMongoType) {
                            var setAtrribute = nestedMongoType + ".salesId";
                            var proj = {};
                            proj[setAtrribute] = result[0].id;
                            var d = {$set: proj};
                            mdm.updateDocument(false, {_id: nestedMongoPrntId}, d, mongoType, false).then(function (data) {
                                def.resolve(true)
                            });
                        } else {
                            var d = {$set: {"salesId": result[0].id}};
                            mdm.updateDocument(false, {_id: mongoId}, d, mongoType, false).then(function (data) {
                                def.resolve(true)
                            });
                        }
                    })
                } catch (e) {
                    log.info(e);
                    def.reject(e);
                } finally {
                    return def.promise;
                }
            }
        } catch (e) {
            d.reject(e);
            log.info('error is ' + e)
        } finally {
            return d.promise;
        }
    },

    deleteAndlogRecords: function (config, mdm, sf) {
        try {
            var d = Q.defer();
            var promises = [];
            var pullPromise = [];
            var pushPromise = [];
            var teampCache = {};
            var teampCacheMIM = {};
            var difftempCache = {'Id': []};
            var mapping = mapper.getMapping(false);

            for (var i = 0; i < mapping.mongoCollections.length; i++) {
                var p = _fillTempCache(config.name + '.' + mapping.masterCollections[i], mdm.mimdb, teampCacheMIM);
                pullPromise.push(p);
            }
            for (var i = 0; i < mapping.mongoCollections.length; i++) {
                var p = _fillTempCache(mapping.masterCollections[i], mdm.db, teampCache);
                promises.push(p);
            }

            var finalProm = promises.concat(pullPromise);
            Q.all(finalProm).then(function (result) {
                log.info('teampCache :' + JSON.stringify(teampCache));
                log.info('teampCacheMIM :' + JSON.stringify(teampCacheMIM));
                for (var key in teampCacheMIM) {
                    if (!teampCacheMIM.hasOwnProperty(key)) {
                        //The current property is not a direct property of p
                        continue;
                    }
                    //Do your logic with the property here
                    if (key.indexOf(config.name) > -1) {
                        var temp1 = teampCacheMIM[key];
                        var temp2 = teampCache[key.substring(config.name.length + 1, key.length)];
                        if (temp2 && temp1) {
                            //if (difftempCache['id']) {
                            var tmp = _.differenceWith(temp1, temp2, _.isEqual);
                            for (var i = 0; i < tmp.length; i++) {
                                difftempCache['Id'].push(tmp[i].salesId);
                            }
                            /*
                             } else {
                             difftempCache['id'] = _.differenceWith(temp1, temp2, _.isEqual);
                             }*/
                        } else {
                            log.info('temporary cache is undefined');
                        }

                    }

                }
                log.info('difftempCache :' + JSON.stringify(difftempCache));
                sf.deleteObjects(difftempCache).then(function (res) {

                    for (var key in teampCache) {
                        if (!teampCache.hasOwnProperty(key)) {
                            //The current property is not a direct property of p
                            continue;
                        }
                        //Do your logic with the property here
                        var p = _logSalesId(key);
                        pushPromise.push(p);
                    }
                    Q.all(pushPromise).then(function (res) {
                        log.info('Logging completed');
                        d.resolve();
                    })
                })

            });

            function _fillTempCache(d, db, cache) {
                var def = Q.defer();
                try {
                    var temp = {};
                    temp['salesId'] = {$exists: true};
                    //{salesId: {$exists: true}}
                    mdm.getDocumnets(db, d, temp, {"salesId": 1, _id: 0}, function (result) {
                        cache[d] = result;
                        def.resolve();
                    })
                    /*.then(function(res){
                     });*/
                } catch (e) {
                    log.error(e);
                    def.reject();
                } finally {
                    return def.promise;
                }
            }

            function _logSalesId(key) {
                try {
                    var d = Q.defer();
                    mdm.deleteDocuments(mdm.mimdb, config.name + '.' + key, {}).then(function (res) {
                        if (teampCache[key].length > 0) {
                            mdm.insertDocuments(mdm.mimdb, config.name + '.' + key, teampCache[key]).then(function (res) {
                                log.info(res);
                                d.resolve(res);
                            }, function (err) {
                                log.error(err);
                                d.reject(err);
                            });
                        } else {
                            log.info('Notihing to insert');
                            d.resolve();
                        }
                    }, function (err) {
                        log.error(err);
                        d.reject(err);
                    });
                } catch (e) {
                    d.reject(e);
                    log.error(e);
                } finally {
                    return d.promise;
                }

            }
        } catch (e) {
            d.reject(e);
            log.error(e);
        } finally {
            return d.promise;
        }

    }
}

module.exports = self;