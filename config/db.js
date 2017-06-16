/**
 * Created by aasheesh on 17/4/17.
 */

var DB;
var self = {

setDB : function (db) {

    DB = db;
},
getDB : function (db) {

    return DB;
}

}

module.exports = self;
