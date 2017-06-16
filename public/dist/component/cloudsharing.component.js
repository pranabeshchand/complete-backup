"use strict";
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
var router_1 = require("@angular/router");
var forms_1 = require("@angular/forms");
var user_service_1 = require("../services/user.service");
var data_service_1 = require("../services/data.service");
var classObj;
var CloudComponent = (function () {
    //showConnect: boolean;
    function CloudComponent(formBuilder, dataservice, router, userservice) {
        this.formBuilder = formBuilder;
        this.dataservice = dataservice;
        this.router = router;
        this.userservice = userservice;
        classObj = this;
        this.dataservice.csvHeader = [];
        this.activePanel = classObj.dataservice.activePanel;
        this.connections = this.userservice.UserDetails.connections ? this.userservice.UserDetails.connections : {};
        this.files = [];
        this.folders = [];
        this.folderLevel = [];
        this.showFileLoader = false;
        this.currentConnection = {};
        this.dblist = [];
        this.testloader = false;
        this.isOn = true;
        this.connError = false;
        //this.showConnect = false;
    }
    CloudComponent.prototype.ngOnInit = function () {
        if (!this.activePanel) {
            this.activePanel = 'mycomputer';
        }
        this.configForm = this.formBuilder.group({
            host: ['', forms_1.Validators.required],
            port: ['', forms_1.Validators.required],
            username: ['', forms_1.Validators.required],
            password: ['', forms_1.Validators.required]
        });
        this.dbconnectionForm = this.formBuilder.group({
            host: ['', forms_1.Validators.required],
            port: ['', forms_1.Validators.required],
            user: ['', forms_1.Validators.required],
            password: ['', forms_1.Validators.required],
            database: [''],
            type: ['', forms_1.Validators.required]
        });
    };
    CloudComponent.prototype.init = function () {
        this.dataservice.csvHeader = [];
        // this.connections = this.userservice.UserDetails.connections ? this.userservice.UserDetails.connections : {};
        console.log("connection are .........." + JSON.stringify(this.connections, null, 2));
        classObj.folderLevel = [];
        var connObj = classObj.connections[classObj.activePanel];
        classObj.currentConnection = connObj ? connObj[0] : {};
        if (connObj) {
            this.changeConnection();
        }
        else {
            classObj.files = [];
            classObj.folders = [];
        }
        /* if (connObj) {
             classObj.dataservice.getConnectionInfo({connection: classObj.currentConnection}).map(res=> res.json()).subscribe(res=> {
                 if (classObj.currentConnection.type == 'dropbox') {
                     classObj.path = res.data.path;
                     classObj.folderLevel = res.data.path.split('/');
                 } else {
                     classObj.folderLevel = [];
                 }
                 classObj.ListFilesFolders(res.data);
             })
         } else {
             classObj.files = [];
             classObj.folders = [];
         }*/
    };
    CloudComponent.prototype.changeConnection = function () {
        console.log("value is " + JSON.stringify(classObj.currentConnection, null, 2));
        classObj.dataservice.getConnectionInfo({ connection: classObj.currentConnection }).map(function (res) { return res.json(); }).subscribe(function (res) {
            if (classObj.currentConnection.type == 'dropbox') {
                classObj.path = res.data.path;
                classObj.folderLevel = res.data.path.split('/');
            }
            else {
                classObj.folderLevel = [];
            }
            classObj.ListFilesFolders(res.data);
        });
    };
    CloudComponent.prototype.saveFtpConnection = function () {
        var _this = this;
        console.log("saveFtpConnection called.....");
        if (this.configForm.valid) {
            var ftpObj = {
                type: this.activePanel,
                host: this.configForm.controls['host'].value,
                port: this.configForm.controls['port'].value,
                username: this.configForm.controls['username'].value,
                password: this.configForm.controls['password'].value
            };
            this.dataservice.createFtpConnection(ftpObj).map(function (res) { return res.json(); }).subscribe(function (res) {
                console.log("response is " + JSON.stringify(res, null, 2));
                /* document.getElementById('myModal').modal('hide');*/
                _this.connections = res.connection;
                classObj.currentConnection = res.connection[classObj.activePanel][0];
                _this.ListFilesFolders(res.data);
            }, function (err) {
                alert(JSON.stringify(err.msg));
            });
        }
    };
    CloudComponent.prototype.goToAttributeMapping = function () {
        if (this.dataservice.csvHeader && classObj.dataservice.csvHeader[0] != "null") {
            classObj.dataservice.step++;
        }
        else {
            alert("The uploaded file format is not correct. Please try again uploading a csv (comma separated values) file.");
        }
    };
    CloudComponent.prototype.PopupCenter = function (url, title, w, h) {
        // Fixes dual-screen position                         Most browsers      Firefox
        var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
        var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
        var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
        var left = ((width / 2) - (w / 2)) + dualScreenLeft;
        var top = ((height / 2) - (h / 2)) + dualScreenTop;
        var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
        // Puts focus on the newWindow
        if (window.focus) {
            newWindow.focus();
        }
        return newWindow;
    };
    CloudComponent.prototype.createConnection = function (type) {
        // this.activePanel = 'dropbox';
        console.log("connections are " + JSON.stringify(this.connections, null, 2));
        var win;
        var url = '';
        if (this.activePanel == 'dropbox') {
            //win = window.open('http://localhost:3000/api/dropbox', '_blank', 'location=yes');
            var win = this.PopupCenter('http://localhost:3000/api/dropbox', 'Salesforce Login', '800', '600');
            url = 'http://localhost:3000/api/oauth/dropbox';
        }
        else if (this.activePanel == 'google_drive') {
            //win = window.open('http://localhost:3000/api/drive', '_blank', 'location=yes');
            var win = this.PopupCenter('http://localhost:3000/api/drive', 'Salesforce Login', '800', '600');
            url = 'http://localhost:3000/api/oauth/drive';
        }
        else if (this.activePanel == 'box') {
            //win = window.open('http://localhost:3000/api/box', '_blank', 'location=yes');
            var win = this.PopupCenter('http://localhost:3000/api/box', 'Salesforce Login', '800', '600');
            url = 'http://localhost:3000/api/oauth/box';
        }
        var pollTimer = window.setInterval(function () {
            try {
                console.log("length" + win.document.URL.length);
                if (win.document.URL.indexOf(url) != -1) {
                    window.clearInterval(pollTimer);
                    classObj.showFileLoader = true;
                    classObj.dataservice.getConnectionInfo({ connection: { type: classObj.activePanel } }).map(function (res) { return res.json(); }).subscribe(function (res) {
                        classObj.showFileLoader = false;
                        classObj.currentConnection = res.connection[classObj.activePanel] ? res.connection[classObj.activePanel][0] : {};
                        classObj.connections = res.connection;
                        classObj.ListFilesFolders(res.data);
                        if (classObj.activePanel == 'dropbox') {
                            classObj.path = res.data.path;
                            classObj.folderLevel = res.data.path.split('/');
                        }
                        else {
                            classObj.folderLevel = [];
                        }
                        //classObj.selectedConnection = res.connection;
                    }, function (err) {
                        console.log("err is " + err);
                    });
                    win.close();
                }
            }
            catch (e) {
            }
        }, 100);
    };
    CloudComponent.prototype.removeConnection = function () {
        var _this = this;
        this.dataservice.deleteConnection(classObj.currentConnection).map(function (res) { return res.json(); }).subscribe(function (res) {
            classObj.showFileLoader = false;
            classObj.connections = res.connection;
            _this.init();
        }, function (err) {
            classObj.showFileLoader = false;
            console.log("err is " + err);
        });
    };
    CloudComponent.prototype.ListFilesFolders = function (data) {
        classObj.files = [];
        classObj.folders = [];
        console.log("box data is " + JSON.stringify(data, null, 2));
        var cloudData = data.contents || data;
        var files = [];
        var folders = [];
        for (var i = 0; i < cloudData.length; i++) {
            if (cloudData[i].is_dir) {
                folders.push(cloudData[i]);
            }
            else {
                files.push(cloudData[i]);
            }
        }
        classObj.files = files;
        classObj.folders = folders;
    };
    CloudComponent.prototype.expandFolder = function (folder) {
        classObj.showFileLoader = true;
        var path = '';
        if (classObj.activePanel == 'box' || classObj.activePanel == 'google_drive') {
            path = folder.id;
        }
        else {
            path = classObj.newpath(folder.name ? folder.name : folder);
        }
        this.dataservice.getConnectionInfo({
            path: path,
            connection: classObj.currentConnection
        }).map(function (res) { return res.json(); }).subscribe(function (res) {
            console.log("folderlevel " + JSON.stringify(res, null, 2));
            classObj.showFileLoader = false;
            classObj.ListFilesFolders(res.data);
            if (classObj.activePanel == 'dropbox') {
                classObj.path = res.data.path;
                classObj.folderLevel = res.data.path.split('/');
            }
            else {
                classObj.path = '';
                var index = classObj.folderLevel.indexOf(folder.name ? folder.name : folder);
                if (index > -1) {
                    var level = classObj.folderLevel.slice(0);
                    classObj.folderLevel = [];
                    for (var i = 0; i <= index; i++) {
                        classObj.folderLevel.push(level[i]);
                    }
                }
                else {
                    classObj.folderLevel.push(folder.name ? folder.name : folder);
                }
                for (var i = 0; i < classObj.folderLevel.length; i++) {
                    classObj.path = classObj.path + '/' + classObj.folderLevel[i];
                }
                classObj.path = classObj.path.substring(1, classObj.path.length) + '/';
            }
            // classObj.folderLevel.push(folder.name ? folder.name : folder);}
        }, function (err) {
            console.log("err is " + JSON.stringify(err, null, 2));
        });
    };
    CloudComponent.prototype.newpath = function (foldername) {
        var index = classObj.folderLevel.indexOf(foldername);
        if (index == -1) {
            index = classObj.folderLevel.length;
        }
        var newpath = '';
        for (var i = 0; i < index; i++) {
            newpath = newpath + '/' + classObj.folderLevel[i];
        }
        if (classObj.activePanel == 'ftp' || classObj.activePanel == 'sftp') {
            if (newpath == '') {
                return foldername;
            }
            else {
                return newpath.substring(1, newpath.length) + '/' + foldername;
            }
        }
        else {
            return newpath + '/' + foldername;
        }
    };
    CloudComponent.prototype.readFile = function (file) {
        var obj = {
            connection: classObj.currentConnection,
            file_path: ''
        };
        if (classObj.activePanel == 'google_drive' || classObj.activePanel == 'box') {
            obj.file_path = file.id;
        }
        else {
            if (classObj.activePanel == 'ftp' || classObj.activePanel == 'sftp') {
                obj.file_path = classObj.path + file.name;
            }
            else {
                obj.file_path = classObj.path + '/' + file.name;
            }
        }
        classObj.showFileLoader = true;
        this.dataservice.readRemoteFile(obj).map(function (res) { return res.json(); }).subscribe(function (res) {
            console.log("res is " + JSON.stringify(res, null, 2));
            classObj.showFileLoader = false;
            // classObj.dataservice.csvHeader = res.csvHeader.map(Function.prototype.call, String.prototype.trim);
            classObj.dataservice.csvHeader = res.csvHeader;
            classObj.dataservice.fileName = res.fileName;
            // obj['csvHeader']  = res.csvHeader;
            //obj['fileName']  = res.fileName;
            classObj.dataservice.fileDetails = JSON.parse(JSON.stringify(obj));
        }, function (err) {
            console.log("err is " + JSON.stringify(err, null, 2));
        });
    };
    CloudComponent.prototype.handleCsvFiles = function (detail) {
        console.log("detail " + detail.target.files[0]);
        classObj.dataservice.uploadedFileName = detail.target.files[0].name;
        var formData = new FormData();
        formData.append('file', detail.target.files[0]);
        this.dataservice.upload(formData).map(function (res) { return res.json(); }).subscribe(function (res) {
            console.log("response is " + res);
            if (res.status) {
                classObj.dataservice.csvHeader = res.csvHeader.map(Function.prototype.call, String.prototype.trim);
                classObj.dataservice.fileName = res.fileName;
                var obj = {
                    connection: {}
                };
                //obj['csvHeader']  = res.csvHeader;
                obj['connection']['type'] = 'MyComputer';
                obj['file_path'] = res.fileName;
                classObj.dataservice.fileDetails = JSON.parse(JSON.stringify(obj));
            }
        }, function (err) {
            console.log("err is " + err);
        });
    };
    /* myConnector(st){
         if(st == '1'){
              this.showConnect = false;
         }else{
              this.showConnect = true;
         }
     }*/
    CloudComponent.prototype.testDbmsConnection = function () {
        this.testloader = true;
        var dbmsTest = {
            data: {
                host: this.dbconnectionForm.controls['host'].value,
                port: this.dbconnectionForm.controls['port'].value,
                user: this.dbconnectionForm.controls['user'].value,
                password: this.dbconnectionForm.controls['password'].value,
                database: this.dbconnectionForm.controls['database'].value
            },
            databaseServer: this.dbconnectionForm.controls['type'].value
        };
        this.dataservice.testConnection(dbmsTest).map(function (res) { return res.json(); }).subscribe(function (res) {
            console.log(res);
            classObj.dblist = res;
            classObj.testloader = false;
            classObj.connError = false;
            classObj.isOn = false;
            console.log("return ", JSON.stringify(classObj.dblist));
        }, function (err) {
            //alert("Access denied: Invalid Credential");
            //console.log('errrr: ', JSON.stringify(err));
            //console.log("eee ",err);
            classObj.connError = true;
            classObj.isOn = true;
            classObj.testloader = false;
            classObj.dblist = err;
        });
    };
    CloudComponent.prototype.saveDbmsConnection = function () {
        var _this = this;
        console.log("dd ", this.testDbmsConnection());
        if (this.dbconnectionForm.valid) {
            var dbmsObj = {
                host: this.dbconnectionForm.controls['host'].value,
                port: this.dbconnectionForm.controls['port'].value,
                user: this.dbconnectionForm.controls['user'].value,
                password: this.dbconnectionForm.controls['password'].value,
                database: this.dbconnectionForm.controls['database'].value,
                type: this.dbconnectionForm.controls['type'].value
            };
            this.dataservice.createDbmsConnection(dbmsObj).map(function (res) { return res.json(); }).subscribe(function (res) {
                alert('dddddd ' + res);
                console.log("response is " + JSON.stringify(res, null, 2));
                /* document.getElementById('myModal').modal('hide');*/
                _this.connections = res.connection;
                classObj.currentConnection = res.connection[classObj.activePanel][0];
                _this.ListFilesFolders(res.data);
            }, function (err) {
                alert(JSON.stringify(err.msg));
            });
        }
        else {
            alert("invalid");
        }
    };
    return CloudComponent;
}());
CloudComponent = __decorate([
    core_1.Component({
        selector: 'cloudsharing',
        templateUrl: './app/templates/cloudsharing.html',
        styleUrls: ['./app/styles/css/cloudsharing.css']
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, data_service_1.DataService, router_1.Router, user_service_1.UserService])
], CloudComponent);
exports.CloudComponent = CloudComponent;
//# sourceMappingURL=cloudsharing.component.js.map