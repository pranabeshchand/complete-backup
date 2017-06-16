/**
 * Created by aasheesh on 30/12/16.
 */

import { Injectable } from '@angular/core';
import {Observable} from "rxjs";

import 'rxjs/add/operator/map';

import { Http, Response, RequestOptions, Request, RequestMethod, URLSearchParams } from '@angular/http'


@Injectable()
export class DataService {

    saveconfig_url:string;
    salesObjects:Array<string>;
    currentMappingObj:any;
    currentSalesObj:String;
    csvHeader:Array;
    clientObj:any;
    selectedFieldsList: Array<string>;
    selectedFields: any;
    task: string;
    fileDetails: any

    constructor(private http:Http) {
        //alert("called");
        this.saveconfig_url = '/api/saveconfiguration';
        this.currentMappingObj = [];
        this.currentSalesObj = null;
        this.csvHeader = [];
        this.clientObj = '';
        this.selectedFields = [];
        this.task = '';
        this.fileDetails = {}
    }

    mongoUrl:string = '/api/mongoObjects';
    salesforceUrl:string = '';


    getUser() {
        return this.http.get('/api/user').map(res => res.json());
    }


    getClientObjects() {
        return this.http.get(this.mongoUrl);
    }

    getFormulaJson() {
        return this.http.request('../app/json/formula.json');
    }

    getFiltersJson() {
        return this.http.request('../app/json/filters.json');
    }

    getSalesforceObjects() {
        return this.http.get('/api/salesObjects');


    }
    getTasklist() {
        return this.http.get('/api/listalltask'); 
    }
    getDeleteTask(id: string) {
        return this.http.get('/api/deleteTask?id='+id);
    }
    getEditTask(filename: string){
        return this.http.get('/api/readTaskcsv?filename='+filename);
    }
    saveConfiguration(clientconfig:any) {
        console.log("service called");
        return this.http.post(this.saveconfig_url, clientconfig);
    }

    saveObjectMapping(objectmapping:Object) {
        return this.http.post('/api/saveobjectmapping', objectmapping);
    }

    testconnectivity(url:any) {
        return this.http.post('/api/testdbconnection', url);
    }

    testSalesforceConnection(useradata:Object) {
        return this.http.post('/api/testSalesforceConnection', useradata);
    }

    getClientAttributes(clientObj:Object) {
        return this.http.post('/api/getClientAttributes', clientObj);
    }

    getSalesAttributes(salesObj:any) {
        return this.http.get('/api/salesObjects/' + salesObj + '/attributes')
    }

    getRecords(soql:any) {
        return this.http.post('/api/fetchrecords', soql);
    }

    login(code) {

       return this.http.get('/oauth2/callback/'+ code);

    }
    upload(file) {

        let headers = new Headers({ 'Content-Type': 'multipart/form-data; charset=UTF-8' });
        let options = new RequestOptions({ headers: headers});
        return this.http.post('/api/uploadfile', file, options);
    }

    readRemoteFile(file_path: any) {
        let params: URLSearchParams = new URLSearchParams();
        params.set('file_path', JSON.stringify(file_path));
        return this.http.get('/api/remotefile', { search: params });
    }

    dropboxConnection() {
        return this.http.get('/api/dropbox');
    }

    getConnectionInfo(user) {

        let params: URLSearchParams = new URLSearchParams();
        params.set('path', JSON.stringify(user));

        return this.http.get('/api/connections', { search: params });
       // return this.http.get('/api/connections');
    }

    getFolderLevel(path: any) {

        let params: URLSearchParams = new URLSearchParams();
        params.set('path', JSON.stringify(path));

        return this.http.get('/api/foldermetadata', { search : params });
    }

    createFtpConnection(ftpconfig) {
        return this.http.post('/api/ftpconnection',ftpconfig);
    }
    testConnection(testconn){
        console.log('test param', testconn);
        return this.http.post('/api/testConnection',testconn);
        //return this.http.post('http://0.0.0.0:3001/api/customApis/testConnection',testconn);
    }
    
    createDbmsConnection(dbmsconfig){
        console.log('connect rdb '+ dbmsconfig);
        return this.http.post('/api/dbmsconnection',dbmsconfig);
    }
    deleteConnection(connection) {
        return this.http.post('/api/removeconnection', connection);
    }

    getCurrentDate() {
        var d = new Date();
        var yyyy = d.getFullYear().toString();
        var MM = pad(d.getMonth() + 1,2);
        var dd = pad(d.getDate(), 2);
        var hh = pad(d.getHours(), 2);
        var mm = pad(d.getMinutes(), 2)
        var ss = pad(d.getSeconds(), 2)
        return yyyy + MM + dd + '.' + hh + mm + ss;

        function pad(number, length) {
            var str = '' + number;
            while (str.length < length) {
                str = '0' + str;
            }
            return str;
        }
    }
}
