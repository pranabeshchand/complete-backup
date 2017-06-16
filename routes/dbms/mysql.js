//console.log("before import");
/*var mysql  = require('mysql'),
 mysqlUtilities = require('mysql-utilities');*/
var bluebirdPromise = require('bluebird');
var mysql = bluebirdPromise.promisifyAll(require("mysql"));
var mysqlUtilities = bluebirdPromise.promisifyAll(require("mysql-utilities"));

var async = require('asyncawait/async');
var await = require('asyncawait/await');


//console.log("before import 2");
//var q = require('q');

var self = {
    checkConnection: function (data) {
        return new bluebirdPromise((resolve, reject) => {
            var connection = mysql.createConnection(data);
            connection.connect(function (err) {
                if (err) {
                    var e = {"msg": "Invalid database info", "error": 0};
                    //console.error('error connecting: ' + err.stack);
                    reject(e);
                    //return "error";
                } else {
                    mysqlUtilities.upgrade(connection);
                    mysqlUtilities.introspection(connection);
                    resolve(connection);
                }

                //console.log('connected as id ' + connection.threadId);
            });
        });
    },

    listDatabases: async function (conn) {
        try {
            console.log("listdatabase called.....");
            var conn = await mysqlConnection(conn);
            console.log("conn is " + conn);
            return new bluebirdPromise((resolve, reject) => {
                conn.databases(function (error, results) {
                    if (error) {
                        var e = {"msg": "invalid database list", "error": 0};
                        console.log(e.msg);
                        reject(e);
                    } else {
                        /* Example:
                         databases: [ 'information_schema', 'mezha', 'mysql', 'performance_schema', 'test' ]
                         */
                        console.log("list ", results);
                        resolve({status: true, databases: results})
                    }
                });
            });
        } catch(e) {
            console.log("exception " + e);
        }

    },
    listTabels: async function (connInfo) {
        var resp = [];
        var conn = await mysqlConnection(connInfo);
        return new bluebirdPromise((resolve, reject) => {
            conn.tables(function (error, results) {
                //conn.query('show tables', function (error, results) {
                if (error) {
                    var e = {"msg": "invalid table list", "error": 0};
                    console.log(error);
                    reject(e);
                } else {
                     var tables = Object.keys(results);
                    console.log("list ", {tables: tables});
                    resolve({status: true, tables: tables})
                }
            });
        });
    },
    describeTable: async function (conninfo, tableName) {
        var conn = await mysqlConnection(conninfo);
        var foreign = await foriegn(conn, tableName);
        console.log('connected as ids ' + conn.threadId);
        return new bluebirdPromise((resolve, reject) => {
              conn.fields(tableName, function (error, results) {
                if (error) {
                    var e = {"msg": "describe table", "error": 0};
                    console.log(error);
                    reject(e);
                } else {
                    var res = Object.values(results);
                    var arr = [];
                    for(var i =0; res.length > i; i++){
                        var pri = "NO";
                        if(res[i].Key == "PRI"){
                            var pri = "YES";
                        } if(res[i].Field == foreign.columnName){
                            arr[i] = {
                                "name":res[i].Field, "datatype": res[i].Type,
                                "IsPrimaryKey": pri, "IsForeignKey": "YES",
                                "IsNullAllowed": res[i].Null , "referenceTable": foreign.referenceTable,
                                "referenceTableColumn": foreign.referenceTableColumn
                            };
                        } else{
                            arr[i] = {
                                "name":res[i].Field, "datatype": res[i].Type,
                                "IsPrimaryKey": pri, "IsForeignKey": "NO",
                                "IsNullAllowed": res[i].Null,  "referenceTable": "",
                                "referenceTableColumn": ""
                            };
                        }

                    }
                    console.log("final resp ", arr);
                    resolve({status: true, tableInfo: arr})
                }
            });
        });
    },
    listRelations: async function (conn, tableName) {
        console.log("========");
        var conn = await mysqlConnection(conn);
        console.log('connected as ids ' + conn.threadId);
        return new bluebirdPromise((resolve, reject) => {
            conn.foreign("employee", function (error, results) {
                if (error) {
                    var e = {"msg": "describe table", "error": 0};
                    console.log(error);
                    reject(e);
                } else {
                    console.log("Table detail ", {foreign: results});
                    resolve({foreign: results})
                }
            });
        });

    }

}
function foriegn(conn, tableName){
    return new bluebirdPromise((resolve, reject) => {
        conn.foreign(tableName, function (error, results) {
            if (error) {
                var e = {"msg": "describe table", "error": 0};
                console.log(error);
                reject(e);
            } else {
                var res = Object.values(results);
                var ob ={};
                if(res.length > 0){
                    for(var i = 0; res.length > i; i++){
                        ob = {"columnName": res[i].COLUMN_NAME, "referenceTable": res[i].REFERENCED_TABLE_NAME,
                              "referenceTableColumn": res[i].REFERENCED_COLUMN_NAME
                             };
                    }
                    /*console.log("vcc ",ob);
                    console.log("Table detail ", res);*/
                }else{
                    //console.log("Table detail ", res.length);
                }

                resolve(ob)
            }
        });
    });
}
 function mysqlConnection(data) {
    return new bluebirdPromise((resolve, reject) => {
     var connection = mysql.createConnection(data);
     connection.connect(function(err) {
     if (err) {
     var e = {"msg": "Invalid database info", "error": 0};
     //console.error('error connecting: ' + err.stack);
     reject(e);
     }else{
     mysqlUtilities.upgrade(connection);
     mysqlUtilities.introspection(connection);
     resolve(connection);
     }
     //console.log('connected as id ' + connection.threadId);
     });
     });
}
module.exports = self;
