var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var Q = require('q');
var circular = require('circular');
var log = require('./../log');

var self = {
    url: null,
    db: null,
    mimurl: null,
    mimdb: null,

    init: function (config) {
        var d = Q.defer();
        try {
            self.url = config.mongourl;
            MongoClient.connect(self.url, function (err, db) {
                if (err) {
                    log.info("Connection error");
                    d.reject(false);
                }
                if (db) {
                    log.info("Connected correctly to client server.");
                    self.db = db;
                    self.mimurl = config.mim.mongourl;
                    MongoClient.connect(self.mimurl, function (err, mdb) {
                        if (err) {
                            log.info("Connection error");
                            d.reject(false);
                        }
                        if (db) {
                            log.info("Connected correctly to mim server.");
                            self.mimdb = mdb;
                            d.resolve(true);
                        }
                    })
                }
            });
        } catch (e) {
            d.reject(false);
            log.info(e);
        } finally {
            return d.promise;
        }
    },

    upsertDocuments: function (data, cname, smflag, callback) {
        var d = Q.defer();
        try {
            var promises = [];

            for (var i = 0; i < data.length; i++) {
                log.info('record is:' + JSON.stringify(data[i].salesId));
                var p = upsertCollection(data[i]);
                promises.push(p);
            }

            Q.all(promises).then(function (res) {
                log.info("upsertDocuments completed");
                d.resolve(true);
            })

            function upsertCollection(record) {
                var def = Q.defer();
                var ob;
                try {
                    if (!cname) {
                        cname = record.type
                    }
                    if (smflag) { //update from sales to mongo
                        ob = {"salesId": record.salesId}
                    } else { // update salesId in mongo
                        ob = {"_id": record.id}
                    }

                    var proj = record;
                    var d = {$set: proj};
                    self.db.collection(cname).update(ob, d, {upsert: true}, function (err, result) {
                        if (err) {
                            def.reject(err);
                            log.info('error is ::' + err);
                        }
                        if (result) {
                            def.resolve(result);
                            log.info('result is::' + JSON.stringify(result));
                        }
                        log.info("Upsert into the collections.");
                    });
                } catch (e) {
                    def.reject(err);
                    log.info(e);
                } finally {
                    return def.promise;
                }
            }
        } catch (e) {
            d.reject(false);
            log.info(e);
        } finally {
            return d.promise;
        }
    },

    insertDocuments: function (db, cname, data) {
        var d = Q.defer();
        try {
            db.collection(cname).insert(data, function (err, result) {
                if (err) {
                    d.reject(err);
                    log.info("error in insertion, " + err);
                } else {
                    log.info('result is ' + result);
                    log.info("Inserted a document in " + cname);
                    d.resolve(result);
                    //callback(result);
                }
            });
        } catch (e) {
            d.reject(e);
            log.info("error in insertion, " + e);
        } finally {
            return d.promise;
        }

    },

    deleteDocuments: function (db, cname, data, callback) {
        var d = Q.defer();
        try {
            db.collection(cname).remove(data, function (err, result) {
                if (err) {
                    d.reject(err);
                    log.info("Error in deletion, " + err);
                } else {
                    log.info('result is ' + result);
                    log.info("Removed the document from " + cname);
                    d.resolve(result);
                    if (callback) {
                        callback(result);
                    }
                }
            });
        } catch (e) {
            d.reject(e);
            log.info("error in deletion, " + e.stack);
        } finally {
            return d.promise;
        }
    },

    getDocumnets: function (db, cname, criteria, projection, callback) {
       // var d = Q.defer();
        try {
            if (projection && criteria) {
                db.collection(cname).find(criteria, projection).toArray(function (err, result) {
                    if (err) {
                       // d.reject(err);
                        log.info("Error in finding, " + err);
                    } else {
                        log.info('result is ' + JSON.stringify(result));
                        log.info("found from the document " + cname);
                      //  d.resolve(result);
                        callback(result);
                    }
                })
            } else if (projection) {
                db.collection(cname).find({}, projection).toArray(function (err, result) {
                    if (err) {
                       // d.reject(err);
                        log.info("Error in finding, " + err);
                    } else {
                        log.info('result is ' + JSON.stringify(result));
                        log.info("found from the document " + cname);
                      //  d.resolve(result);
                        callback(result);
                    }
                })
            } else if (criteria) {
                db.collection(cname).find(criteria).toArray(function (err, result) {
                    if (err) {
                      //  d.reject(err);
                        log.info("Error in finding, " + err);
                    } else {
                        log.info('result is ' + JSON.stringify(result));
                        log.info("found from the document " + cname);
                      //  d.resolve(result);
                        callback(result);
                    }
                })
            } else {
                db.collection(cname).find().toArray(function (err, result) {
                    if (err) {
                     //   d.reject(err);
                        log.info("Error in finding, " + err);
                    } else {
                        log.info('result is ' + JSON.stringify(result));
                        log.info("found from the document " + cname);
                      //  d.resolve(result);
                        callback(result);
                    }
                })
            }
        } catch (e) {
          //  d.reject(e);
            log.info("error in deletion, " + e.stack);
        } /*finally {
            return d.promise;
        }*/


    },

    updateDocument: function (db, id, record, cname, smflag, callback) {
        var d = Q.defer();
        var ob;
        try {
            if (!cname) {
                cname = record.type
            }
            if (smflag) {
                ob = {"salesId": record.salesId}
            } else {
                ob = {"_id": record.id}
            }
            if (!db) {
                db = self.db;
            }
            db.collection(cname).update(id, record, function (err, result) {
                if (err) {
                    d.reject(err);
                    log.error('error is ::' + err);
                }
                if (result) {
                    d.resolve(result);
                    log.info('result is::' + JSON.stringify(result));
                }
                log.info("Updated into the collections.");
            });
        } catch (err) {
            d.reject(err);
            log.info(err);
        } finally {
            return d.promise;
        }
    }

}
module.exports = self;

