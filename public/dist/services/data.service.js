"use strict";
/**
 * Created by aasheesh on 30/12/16.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
require("rxjs/add/operator/map");
var http_1 = require("@angular/http");
var DataService = (function () {
    function DataService(http) {
        this.http = http;
        this.mongoUrl = '/api/mongoObjects';
        this.salesforceUrl = '';
        //alert("called");
        this.saveconfig_url = '/api/saveconfiguration';
        this.currentMappingObj = [];
        this.currentSalesObj = null;
        this.csvHeader = [];
        this.clientObj = '';
        this.selectedFields = [];
        this.task = '';
        this.fileDetails = {};
    }
    DataService.prototype.getUser = function () {
        return this.http.get('/api/user').map(function (res) { return res.json(); });
    };
    DataService.prototype.getClientObjects = function () {
        return this.http.get(this.mongoUrl);
    };
    DataService.prototype.getFormulaJson = function () {
        return this.http.request('../app/json/formula.json');
    };
    DataService.prototype.getFiltersJson = function () {
        return this.http.request('../app/json/filters.json');
    };
    DataService.prototype.getSalesforceObjects = function () {
        return this.http.get('/api/salesObjects');
    };
    DataService.prototype.getTasklist = function () {
        return this.http.get('/api/listalltask');
    };
    DataService.prototype.getDeleteTask = function (id) {
        return this.http.get('/api/deleteTask?id=' + id);
    };
    DataService.prototype.getEditTask = function (filename) {
        return this.http.get('/api/readTaskcsv?filename=' + filename);
    };
    DataService.prototype.saveConfiguration = function (clientconfig) {
        console.log("service called");
        return this.http.post(this.saveconfig_url, clientconfig);
    };
    DataService.prototype.saveObjectMapping = function (objectmapping) {
        return this.http.post('/api/saveobjectmapping', objectmapping);
    };
    DataService.prototype.testconnectivity = function (url) {
        return this.http.post('/api/testdbconnection', url);
    };
    DataService.prototype.testSalesforceConnection = function (useradata) {
        return this.http.post('/api/testSalesforceConnection', useradata);
    };
    DataService.prototype.getClientAttributes = function (clientObj) {
        return this.http.post('/api/getClientAttributes', clientObj);
    };
    DataService.prototype.getSalesAttributes = function (salesObj) {
        return this.http.get('/api/salesObjects/' + salesObj + '/attributes');
    };
    DataService.prototype.getRecords = function (soql) {
        return this.http.post('/api/fetchrecords', soql);
    };
    DataService.prototype.login = function (code) {
        return this.http.get('/oauth2/callback/' + code);
    };
    DataService.prototype.upload = function (file) {
        var headers = new Headers({ 'Content-Type': 'multipart/form-data; charset=UTF-8' });
        var options = new http_1.RequestOptions({ headers: headers });
        return this.http.post('/api/uploadfile', file, options);
    };
    DataService.prototype.readRemoteFile = function (file_path) {
        var params = new http_1.URLSearchParams();
        params.set('file_path', JSON.stringify(file_path));
        return this.http.get('/api/remotefile', { search: params });
    };
    DataService.prototype.dropboxConnection = function () {
        return this.http.get('/api/dropbox');
    };
    DataService.prototype.getConnectionInfo = function (user) {
        var params = new http_1.URLSearchParams();
        params.set('path', JSON.stringify(user));
        return this.http.get('/api/connections', { search: params });
        // return this.http.get('/api/connections');
    };
    DataService.prototype.getFolderLevel = function (path) {
        var params = new http_1.URLSearchParams();
        params.set('path', JSON.stringify(path));
        return this.http.get('/api/foldermetadata', { search: params });
    };
    DataService.prototype.createFtpConnection = function (ftpconfig) {
        return this.http.post('/api/ftpconnection', ftpconfig);
    };
    DataService.prototype.testConnection = function (testconn) {
        console.log('test param', testconn);
        return this.http.post('/api/testConnection', testconn);
        //return this.http.post('http://0.0.0.0:3001/api/customApis/testConnection',testconn);
    };
    DataService.prototype.createDbmsConnection = function (dbmsconfig) {
        console.log('connect rdb ' + dbmsconfig);
        return this.http.post('/api/dbmsconnection', dbmsconfig);
    };
    DataService.prototype.deleteConnection = function (connection) {
        return this.http.post('/api/removeconnection', connection);
    };
    DataService.prototype.getCurrentDate = function () {
        var d = new Date();
        var yyyy = d.getFullYear().toString();
        var MM = pad(d.getMonth() + 1, 2);
        var dd = pad(d.getDate(), 2);
        var hh = pad(d.getHours(), 2);
        var mm = pad(d.getMinutes(), 2);
        var ss = pad(d.getSeconds(), 2);
        return yyyy + MM + dd + '.' + hh + mm + ss;
        function pad(number, length) {
            var str = '' + number;
            while (str.length < length) {
                str = '0' + str;
            }
            return str;
        }
    };
    return DataService;
}());
DataService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], DataService);
exports.DataService = DataService;
//# sourceMappingURL=data.service.js.map