import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { DataService } from '../services/data.service';
import { CloudService } from '../services/cloudsharing.service';
import { Observable } from "rxjs";
import { PopoverModule } from 'ngx-popover';
import * as BoxSDK from 'boxsdk';
import * as CircularJson from 'CircularJson';

let classObj:any
@Component({
    selector: 'cloudsharing',
    templateUrl: './app/templates/cloudsharing.html',
    styleUrls: ['./app/styles/css/cloudsharing.css']
})

export class CloudComponent implements OnInit {
    configForm:FormGroup;
    dbconnectionForm:FormGroup;
    dropboxAccountDetails:Object;
    dropboxUsers:Array;
    activePanel:String;
    fileDetails:Array;
    client:Object;
    connections:any
    files:Array
    folders:Array
    folderLevel:Array
    currentConnection:any
    showFileLoader:boolean
    dblist: Array;
    testloader: boolean;
    isOn: boolean;
    connError: boolean;
    //showConnect: boolean;

    constructor(private formBuilder:FormBuilder, private dataservice:DataService, private router:Router, private userservice:UserService) {
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
        this.isOn= true;
        this.connError = false;
        //this.showConnect = false;
    }

    ngOnInit() {
        if (!this.activePanel) {
            this.activePanel = 'mycomputer';
        }
        this.configForm = this.formBuilder.group({
            host: ['', Validators.required],
            port: ['', Validators.required],
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        this.dbconnectionForm = this.formBuilder.group({
            host: ['', Validators.required],
            port: ['', Validators.required],
            user: ['', Validators.required],
            password: ['', Validators.required],
            database: [''],
            type: ['', Validators.required]
        });
    }

    init() {
        this.dataservice.csvHeader = [];
        // this.connections = this.userservice.UserDetails.connections ? this.userservice.UserDetails.connections : {};
        console.log("connection are .........." + JSON.stringify(this.connections, null, 2));
        classObj.folderLevel = [];
        var connObj = classObj.connections[classObj.activePanel];
        classObj.currentConnection = connObj ? connObj[0] : {};
        if(connObj) {
            this.changeConnection();
        } else {
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


    }

    changeConnection() {
        console.log("value is " + JSON.stringify(classObj.currentConnection,null,2));

            classObj.dataservice.getConnectionInfo({connection: classObj.currentConnection}).map(res=> res.json()).subscribe(res=> {
                if (classObj.currentConnection.type == 'dropbox') {
                    classObj.path = res.data.path;
                    classObj.folderLevel = res.data.path.split('/');
                } else {
                    classObj.folderLevel = [];
                }
                classObj.ListFilesFolders(res.data);
            })


    }

    saveFtpConnection() {
        console.log("saveFtpConnection called.....");
        if (this.configForm.valid) {
            var ftpObj = {
                type: this.activePanel,
                host: this.configForm.controls['host'].value,
                port: this.configForm.controls['port'].value,
                username: this.configForm.controls['username'].value,
                password: this.configForm.controls['password'].value
            }
            this.dataservice.createFtpConnection(ftpObj).map(res=> res.json()).subscribe(res=> {
                console.log("response is " + JSON.stringify(res, null, 2));
                /* document.getElementById('myModal').modal('hide');*/
                this.connections = res.connection;
                classObj.currentConnection = res.connection[classObj.activePanel][0];

                this.ListFilesFolders(res.data);

            }, err=> {
                alert(JSON.stringify(err.msg));
            })
        }
    }

    goToAttributeMapping() {
        if (this.dataservice.csvHeader && classObj.dataservice.csvHeader[0] != "null") {
            classObj.dataservice.step++;
        } else {
            alert("The uploaded file format is not correct. Please try again uploading a csv (comma separated values) file.");
        }
    }

    PopupCenter(url, title, w, h) {
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
    }

    createConnection(type) {
        // this.activePanel = 'dropbox';
        console.log("connections are " + JSON.stringify(this.connections, null, 2))
        var win;
        var url = '';
        if (this.activePanel == 'dropbox') {
            //win = window.open('http://localhost:3000/api/dropbox', '_blank', 'location=yes');
            var win = this.PopupCenter('http://localhost:3000/api/dropbox','Salesforce Login','800','600')
            url = 'http://localhost:3000/api/oauth/dropbox';
        } else if (this.activePanel == 'google_drive') {
            //win = window.open('http://localhost:3000/api/drive', '_blank', 'location=yes');
            var win = this.PopupCenter('http://localhost:3000/api/drive','Salesforce Login','800','600')
            url = 'http://localhost:3000/api/oauth/drive';
        } else if (this.activePanel == 'box') {
            //win = window.open('http://localhost:3000/api/box', '_blank', 'location=yes');
            var win = this.PopupCenter('http://localhost:3000/api/box','Salesforce Login','800','600')
            url = 'http://localhost:3000/api/oauth/box';
        }

        var pollTimer = window.setInterval(function () {
            try {
                console.log("length" + win.document.URL.length);

                if (win.document.URL.indexOf(url) != -1) {
                    window.clearInterval(pollTimer);
                    classObj.showFileLoader = true;
                    classObj.dataservice.getConnectionInfo({connection: {type: classObj.activePanel}}).map(res=> res.json()).subscribe(res=> {
                        classObj.showFileLoader = false;

                        classObj.currentConnection = res.connection[classObj.activePanel] ? res.connection[classObj.activePanel][0] : {};
                        classObj.connections = res.connection;
                        classObj.ListFilesFolders(res.data);
                        if (classObj.activePanel == 'dropbox') {
                            classObj.path = res.data.path;
                            classObj.folderLevel = res.data.path.split('/');
                        } else {

                            classObj.folderLevel = [];
                        }


                        //classObj.selectedConnection = res.connection;
                    }, err=> {
                        console.log("err is " + err);
                    })
                    win.close();

                }
            } catch (e) {
            }
        }, 100);
    }

    removeConnection() {

        this.dataservice.deleteConnection(classObj.currentConnection).map(res=> res.json()).subscribe(res=> {
            classObj.showFileLoader = false;
            classObj.connections = res.connection;
            this.init();
        }, function (err) {
            classObj.showFileLoader = false;
            console.log("err is " + err);
        })
    }


    ListFilesFolders(data) {
        classObj.files = [];
        classObj.folders = [];
        console.log("box data is " + JSON.stringify(data, null, 2));
        var cloudData = data.contents || data;
        var files = [];
        var folders = [];
        for (var i = 0; i < cloudData.length; i++) {
            if (cloudData[i].is_dir) {
                folders.push(cloudData[i]);
            } else {
                files.push(cloudData[i]);
            }
        }
        classObj.files = files;
        classObj.folders = folders;

    }

    expandFolder(folder) {
        classObj.showFileLoader = true;
        var path = '';
        if (classObj.activePanel == 'box' || classObj.activePanel == 'google_drive') {
            path = folder.id
        } else {
            path = classObj.newpath(folder.name ? folder.name : folder);
        }

        this.dataservice.getConnectionInfo({
            path: path,
            connection: classObj.currentConnection
        }).map(res=>res.json()).subscribe(res=> {
            console.log("folderlevel " + JSON.stringify(res, null, 2))
            classObj.showFileLoader = false;
            classObj.ListFilesFolders(res.data);
            if (classObj.activePanel == 'dropbox') {
                classObj.path = res.data.path;
                classObj.folderLevel = res.data.path.split('/');
            } else {
                classObj.path = ''
                var index = classObj.folderLevel.indexOf(folder.name ? folder.name : folder);
                if (index > -1) {
                    var level = classObj.folderLevel.slice(0);
                    classObj.folderLevel = [];
                    for (var i = 0; i <= index; i++) {
                        classObj.folderLevel.push(level[i]);
                    }
                } else {
                    classObj.folderLevel.push(folder.name ? folder.name : folder);
                }
                for (var i = 0; i < classObj.folderLevel.length; i++) {
                    classObj.path = classObj.path + '/' + classObj.folderLevel[i];
                }
                classObj.path = classObj.path.substring(1, classObj.path.length) + '/';
            }


            // classObj.folderLevel.push(folder.name ? folder.name : folder);}


        }, err=> {
            console.log("err is " + JSON.stringify(err, null, 2));
        })
    }


    newpath(foldername) {

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
            } else {
                return newpath.substring(1, newpath.length) + '/' + foldername;

            }
        } else {
            return newpath + '/' + foldername;
        }

    }

    readFile(file) {
        var obj = {
            connection: classObj.currentConnection,
            file_path: ''
        }
        if (classObj.activePanel == 'google_drive' || classObj.activePanel == 'box') {
            obj.file_path = file.id;
        } else {
            if(classObj.activePanel == 'ftp' || classObj.activePanel == 'sftp') {
                obj.file_path = classObj.path + file.name;
            } else {
                obj.file_path = classObj.path + '/'+ file.name;
            }

        }
        classObj.showFileLoader = true;
        this.dataservice.readRemoteFile(obj).map(res=> res.json()).subscribe(res=> {
            console.log("res is " + JSON.stringify(res, null, 2));
            classObj.showFileLoader = false;
            // classObj.dataservice.csvHeader = res.csvHeader.map(Function.prototype.call, String.prototype.trim);
            classObj.dataservice.csvHeader = res.csvHeader;
            classObj.dataservice.fileName = res.fileName;
           // obj['csvHeader']  = res.csvHeader;

            //obj['fileName']  = res.fileName;
            classObj.dataservice.fileDetails = JSON.parse(JSON.stringify(obj));
        }, err=> {
            console.log("err is " + JSON.stringify(err, null, 2));
        })
    }


    handleCsvFiles(detail) {
        console.log("detail " + detail.target.files[0]);
        classObj.dataservice.uploadedFileName = detail.target.files[0].name;
        let formData = new FormData();
        formData.append('file', detail.target.files[0]);
        this.dataservice.upload(formData).map(res=> res.json()).subscribe(res=> {
            console.log("response is " + res);
            if (res.status) {
                classObj.dataservice.csvHeader = res.csvHeader.map(Function.prototype.call, String.prototype.trim);
                classObj.dataservice.fileName = res.fileName;
                var obj = {
                    connection: {}
                };
                //obj['csvHeader']  = res.csvHeader;
                obj['connection']['type'] = 'MyComputer';
                obj['file_path']  = res.fileName;
                classObj.dataservice.fileDetails = JSON.parse(JSON.stringify(obj));


            }
        }, err=> {
            console.log("err is " + err);
        })

    }
   /* myConnector(st){
        if(st == '1'){
             this.showConnect = false;
        }else{
             this.showConnect = true;
        }
    }*/
    testDbmsConnection(){
        this.testloader = true;
        var dbmsTest = {
            data:{
                host: this.dbconnectionForm.controls['host'].value,
                port: this.dbconnectionForm.controls['port'].value,
                user: this.dbconnectionForm.controls['user'].value,
                password: this.dbconnectionForm.controls['password'].value,
                database: this.dbconnectionForm.controls['database'].value
            },
            databaseServer: this.dbconnectionForm.controls['type'].value
        };
        this.dataservice.testConnection(dbmsTest).map(res => res.json()).subscribe(res => {
                console.log(res);
            classObj.dblist = res;
            classObj.testloader = false;
            classObj.connError = false;
            classObj.isOn= false;
            console.log("return ", JSON.stringify(classObj.dblist));
         }, err=> {
            //alert("Access denied: Invalid Credential");
            //console.log('errrr: ', JSON.stringify(err));
            //console.log("eee ",err);
            classObj.connError = true;
            classObj.isOn= true;
            classObj.testloader = false;
            classObj.dblist = err;
         });
     }
    saveDbmsConnection(){
       console.log("dd ",this.testDbmsConnection());
        if (this.dbconnectionForm.valid) {
            var dbmsObj = {
                host: this.dbconnectionForm.controls['host'].value,
                port: this.dbconnectionForm.controls['port'].value,
                user: this.dbconnectionForm.controls['user'].value,
                password: this.dbconnectionForm.controls['password'].value,
                database: this.dbconnectionForm.controls['database'].value,
                type: this.dbconnectionForm.controls['type'].value
            };
            this.dataservice.createDbmsConnection(dbmsObj).map(res=> res.json()).subscribe(res=> {
                alert('dddddd '+res);
                console.log("response is " + JSON.stringify(res, null, 2));
                /* document.getElementById('myModal').modal('hide');*/
                this.connections = res.connection;
                classObj.currentConnection = res.connection[classObj.activePanel][0];

                this.ListFilesFolders(res.data);

            }, err=> {
                alert(JSON.stringify(err.msg));
            })
        }else{
            alert("invalid");
        }

    }


}
