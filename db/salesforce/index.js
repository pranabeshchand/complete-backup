var Q = require('q');
var appRoot = require('app-root-path');
var soap = require('soap');
var _ = require('lodash');
var log = require('./../log');

var self = {
    //TODO close session after work finishes
    soapSession: null,
    userName: null,
    password: null,
    wsdlLoc: null,
    init: function (config) {
        var d = Q.defer();
        try {
            if (config) {
                self.username = config.user
                self.wsdlLoc = config.wsdlLocation
                self.password = config.password;
                d.resolve(true);
            }
        } catch (e) {
            log.info('Error is :' + e);
            d.reject(e);
        } finally {
            log.info('Inside sf.init finally');
            return d.promise;
        }
    },

    query: function (query) {
        return self.soapCall('queryAll', {queryString: query});
    },

    soapCall: function (fnname, payload, callback) {
        var d = Q.defer();

        try {
            self.getSoapSession(function (s) {
                try {
                    var sheader = {SessionHeader: {sessionId: s.result.result.sessionId}};
                    var qoptions = {QueryOptions: {batchSize: 200}};
                    s.client.addSoapHeader(sheader, "", "tns", "urn:partner.soap.sforce.com");
                    s.client.addSoapHeader(qoptions, "", "tns", "urn:partner.soap.sforce.com");
                    s.client.setEndpoint(s.result.result.serverUrl);
                    //var p = s.client.query(payload);
                    s.client[fnname](payload, function (err, result) {
                        log.info('result for query::' + JSON.stringify(result));
                        if (err) {
                            log.info(err.message);
                            d.reject(err);
                            return d.promise;
                        }

                        if (result && result.result) {
                            result = result.result;
                        } else {
                            log.info('No result returned from ' + s.result.result.serverUrl + ' [' + fnname + '].');
                            d.resolve("Nothing to delete");
                            return d.promise;
                        }
                        log.info(s.result.result.serverUrl + ' [' + fnname + '] successful');
                        d.resolve(result);

                    });
                } catch (e) {
                    __handleError(d, e);
                }
            }, function (err) {
                __handleError(d, err);
            });
        } catch (e) {
            __handleError(d, err);
        } finally {
            return d.promise;
        }

        function __handleError(d, err) {
            d.reject(err);
            log.info(err);

            if (callback) {
                callback(err, false);
            }
        }
    },

    getSoapSession: function (callback, errorCallback) {
        var d = Q.defer();
        try {
            log.info('wsdl location::' + appRoot + self.wsdlLoc);
            soap.createClient(appRoot + self.wsdlLoc, function (err, client) {
                log.info('\t\tLogging in to Salesforce...');
                if (err) {
                    log.info('creating client error::' + err);
                    if (errorCallback) {
                        errorCallback(err);
                    }
                    d.reject(err);
                    return;
                }
                log.info('The salesforce credentials at the time of syncRun ' + self.username + ' pwd is :' + self.password);

                client.login({
                    username: self.username,
                    password: self.password
                }, function (err, result, raw) {
                    log.info('\t\tDone.');
                    if (err) {
                        log.info('error login client::' + JSON.stringify(err, null, 2));
                        if (errorCallback) {
                            errorCallback(err);
                        }
                        d.reject(err);
                        return;
                    }

                    log.info('Endpoint: ' + result.result.serverUrl);

                    self.soapSession = {};
                    self.soapSession.client = client;
                    self.soapSession.result = result;

                    //tls.setSfSOAP(utils.getCurrentTenant(), soapSession);
                    d.resolve(self.soapSession);

                    if (callback) {
                        callback(self.soapSession);
                    }
                })
            });
        } catch (e) {
            d.reject(e);
            log.error(e);
        } finally {
            return d.promise;
        }
    },

    upsertObjects: function (data) {
        try {
            var d = Q.defer();
            var sobjects = data;
            _removeMongoSpecificAtr(sobjects);
            self.soapCall('upsert', {externalIdFieldName: 'Id', sObjects: sobjects}).then(function (results) {
                if (results) {
                    d.resolve(results);
                    log.info('The result from sf is:' + JSON.stringify(results));
                }
            });

            function _removeMongoSpecificAtr(sobjects) {
                for (var i = 0; i < sobjects.length; i++) {
                    for (var k in sobjects[i]) {
                        if (!sobjects[i].hasOwnProperty(k)) {
                            //The current property is not a direct property of p
                            continue;
                        }
                        //Do your logic with the property here
                        if (k.indexOf('__') == 0) {
                            delete sobjects[i][k];
                        }

                    }
                }
            }
        } catch (e) {
            log.info('the error from sf is::' + e);
            d.reject(e);
        } finally {
            return d.promise;
        }

    },

    deleteObjects: function (data) {
        try {
            var d = Q.defer();
            //{id:['0012800000crWojAAE','0012800000cr9V7AAI']}
            if (data) {
                self.soapCall('delete', data).then(function (results) {
                    if (results) {
                        d.resolve(results);
                        log.info('The result from sf is:' + JSON.stringify(results));
                    }
                }, function (err) {
                    d.reject(err);
                    log.error('The result from sf is:' + err);
                });
            } else {
                log.error('No data fro deltion');
                d.resolve();
            }
        } catch (e) {
            log.info('the error from sf is::' + e);
            d.reject(e);
        } finally {
            return d.promise;
        }

    }


}
module.exports = self;
