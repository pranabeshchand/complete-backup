//var sf = require('../salesforce');
var Q = require('q');
var moment = require('moment');
//var mdm = require('../mongomdm');
var mapper = require('../mapper');
var log = require('./../log');

var self = {
    lastSyn: null,
    jobStatus: null,
    sfmongo: function (config, mdm, sf) {

        var promises = [];
        var d = Q.defer();
        var upsertDoc = {};
        try {
            self.jobStatus = 'I' //Incomplete
            var mapping = mapper.getMapping(true);

            /*            mdm.init(config).then(function (res) {
             sf.init(config.salesforce).then(function (res) {*/
            mdm.getDocumnets(mdm.mimdb, config.mim.syncTable, false, false, function (res) {
                log.info("res is " + JSON.stringify(res));
                for (var i = 0; i < mapping.soMappings.length; i++) {
                    var query = mapping.soMappings[i].query + res[0].lastSyncTime;
                    var p = sf.query(query);
                    promises.push(p);
                }

                Q.all(promises).then(function (results) {

                    log.info('result is :' + JSON.stringify(results));
                    for (var i = 0; i < results.length; i++) {
                        var records = results[i].records;
                        if (records) {
                            var op = _convertToArJson(records, mapping.soMappings[i]);
                        } else {
                            continue;
                        }
                        /*      if(upsertDoc[mapping.soMappings[i]['destModel']]) {

                         } else {*/

                        //prntSfType : only in case of many to one from salesmongo
                        if (mapping.soMappings[i].prntSfType) {
                            for (var k = 0; k < records.length; k++) {
                                if (!records[k].IsDeleted) {
                                    if (upsertDoc[mapping.soMappings[i].prntModel]) {
                                        var fi = _.findIndex(upsertDoc[mapping.soMappings[i].prntModel], ["salesId", records[k][mapping.soMappings[i]['prntId']]]);
                                        if (fi > -1) {
                                            var temp = {};
                                            var fiTemp = _.findIndex(op.upsertData, ["salesId", records[k][mapping.soMappings[i].Id[0]]]);
                                            temp[mapping.soMappings[i]['nestedType']] = op.upsertData[fiTemp];
                                            // _.merge(upsertDoc[mapping.soMappings[i].prntSfType][fi], op.upsertData);
                                            _.merge(upsertDoc[mapping.soMappings[i].prntModel][fi], temp);
                                        } else {
                                            setTimeout(_do(mapping.soMappings[i], records), 5000);
                                            var fi = _.findIndex(upsertDoc[mapping.soMappings[i].prntSfType], ["salesId", records[mapping.soMappings[i].prndId]]);

                                            var temp = {};
                                            temp[mapping.soMappings[i].destModel] = op.upsertData;
                                            // _.merge(upsertDoc[mapping.soMappings[i].prntSfType][fi], op.upsertData);
                                            _.merge(upsertDoc[mapping.soMappings[i].prntSfType][fi], temp);
                                        }
                                    } else {
                                        setTimeout(_do(mapping.soMappings[i], records), 5000);
                                        var fi = _.findIndex(upsertDoc[mapping.soMappings[i].prntSfType], ["salesId", records[mapping.soMappings[i].prndId]]);

                                        var temp = {};
                                        temp[mapping.soMappings[i].destModel] = op.upsertData;
                                        // _.merge(upsertDoc[mapping.soMappings[i].prntSfType][fi], op.upsertData);
                                        _.merge(upsertDoc[mapping.soMappings[i].prntSfType][fi], temp);
                                    }

                                }
                            }
                        } else {
                            upsertDoc[mapping.soMappings[i]['destModel']] = op.upsertData;
                            var s = mapping.soMappings[i]['destModel'] + '@delete';
                            upsertDoc[s] = op.deleteData;
                        }
                        /*      }*/
                        function _do(mapping, sfobj) {
                            var mapp = mapper.getMapping(true);
                            var firstMatch = false;
                            var i = 0;
                            var bq;
                            while (!firstMatch) {
                                if (mapp[i].sfType == mapping.prntSfType) {
                                    bq = mapp[i].basicQuery + ' where Id = ' + sfobj[mapping.prndId];
                                    firstMatch = true;
                                } else {
                                    i++;
                                }
                            }
                            sf.query(bq).then(function (result) {
                                var op = _convertToArJson(result.records, mapp[i]);
                                upsertDoc[mapp[i]['destModel']] = op.upsertData;
                                var s = mapp[i]['destModel'] + '@delete';
                                upsertDoc[s] = op.deleteData;
                            })
                        }
                    }
                    log.info('upsertDoc :' + JSON.stringify(upsertDoc));
                    d.resolve(upsertDoc);
                });

            });
            /*                });
             });*/
            function _convertToArJson(records, mapping) {
                var ret = {};
                var upsertDate = [];
                var deletData = [];
                for (var k = 0; k < records.length; k++) {
                    if (records[k].IsDeleted && (records[k]['IsDeleted'] == "true")) {
                        var t = {'salesId': records[k].Id[0]};
                        deletData.push(t);
                    } else {
                        var t = mapper.convertsfobject(records[k], mapping);
                        upsertDate.push(t);
                    }
                }
                ret['upsertData'] = upsertDate;
                ret['deleteData'] = deletData;
                return ret;
            }


        } catch (e) {
            d.reject(e);
            log.info('error is: ' + e.stack);
        } finally {
            return d.promise;
        }

    },

    processCollections: function (documents, mdm) {
        try {
            var d = Q.defer();
            var promices = [];
            for (var key in documents) {
                if (!documents.hasOwnProperty(key)) {
                    //The current property is not a direct property of p
                    continue;
                }
                //Do your logic with the property here
                // For Sf to mongo Delete
                if (key.indexOf('@delete') > -1) {
                    promices.push(_deleteRecords(documents[key], key));
                } else {
                    promices.push(mdm.upsertDocuments(documents[key], key, true));
                }


            }
            Q.all(promices).then(function (results) {
                d.resolve(results);
                self.jobStatus = 'C';
            }, function (error) {
                d.resolve(error);
                self.jobStatus = 'F';
            });

            function _deleteRecords(documents, key) {
                try {
                    var def = Q.defer();
                    var prom = [];
                    var delCol = key.substring(0, key.indexOf('@delete'))
                    for (var m = 0; m < documents.length; m++) {
                        prom.push(mdm.deleteDocuments(mdm.db, delCol, documents[m], function (res) {
                        }));
                    }

                    Q.all(prom).then(function (res) {
                        def.resolve(res);
                        log.info(res);
                    });

                } catch (e) {
                    def.reject(e);
                    log.info(e);

                } finally {
                    return def.promise;
                }
            }
        } catch (e) {
            d.reject(e);
            log.info(e)
        } finally {
            return d.promise;
        }
    }
}

module.exports = self;



