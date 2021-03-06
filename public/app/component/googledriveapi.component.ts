import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { DataService } from '../services/data.service';
import { CloudService } from '../services/cloudsharing.service';
import { Observable } from "rxjs";
import * as GoogleDriveApi from 'googledriveapi';


let classObj:any
@Component({
    selector: 'googledrive',
    templateUrl: './app/templates/googledrive.html',
    styleUrls: ['./app/styles/css/cloudsharing.css']
})

export class GoogleDriveComponent {
    googleDriveFiles:Array;
    googleDriveFolderLevel:Array;
    googleDriveAccountDetails:Object;
    googleDriveToken:Object;

    constructor(private cloudservice:CloudService, private dataservice:DataService, private router:Router) {
        classObj = this;
        this.googleDriveFiles = [];
        this.googleDriveFolderLevel = [];
        this.googleDriveAccountDetails = {};
        this.googleDriveToken = {};
        classObj.cloudservice.googleDriveFolderLevel = [];
    }

   /* initPicker() {
        if(classObj.googleDriveFiles.length == 0) {
            var picker = new GoogleDriveApi({
                apiKey: 'AIzaSyAmOK6hQtmjXcUi5veiLnUU_1FTVyeT0RA',
                clientId: '400146389131-4b28l91a5r08e088i1o923tll9crl757',
                buttonEl: document.getElementById('google-drive'),
                onSelect: function (file,token) {
                    classObj.googleDriveToken = token;
                    classObj.cloudservice.googleDriveToken = token;
                    classObj.displayGoogleDrive(file);
                }
            });
        }
    }*/
     getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

    initPicker() {
        var win = window.open('http://localhost:3000/api/drive','_blank','location=yes');
        var pollTimer   =   window.setInterval(function() {
            try {
                console.log(typeof win.document.URL);
                if (win.document.URL.indexOf('http://localhost:3000/api/oauth/drive') != -1) {
                    window.clearInterval(pollTimer);
                    classObj.dataservice.getAllConnections().map(res=> res.json()).subscribe(res=> {
                        var currentConnection = res.connections[res.connections.length - 1];
                        classObj.dataservice.getconnectionInfo().map(res=> res.json()).subscribe(res=> {

                        })
                        console.log("current is " + JSON.stringify(currentConnection,null,2));
                    }, err=> {
                        console.log("err is " + err);
                    })
                    win.close();
                }
            } catch(e) {
            }
        }, 100);
    }

    displayGoogleDrive(file) {
        var filesLength = file.items.length;
        var files = [];
        var folders = [];
        var topFolder = [];
        for(var i=0; i<filesLength; i++) {
            if(file.items[i].mimeType == 'application/vnd.google-apps.folder')
            {
                folders.push(file.items[i]);
            }
            else {
                files.push(file.items[i]);
            }
        }
        var googleFileDetails = [];
        var subFolderArray = [];

        for(var i=0; i<files.length; i++) {
            if(files[i].parents[0]) {
                if(files[i].parents[0].isRoot) {
                    googleFileDetails.push(files[i]);
                    if(classObj.googleDriveAccountDetails && !classObj.googleDriveAccountDetails.displayName) {
                        classObj.googleDriveAccountDetails = files[i].owners[0];
                    }
                } else {
                    subFolderArray.push(files[i]);
                }
            }
        }
        for(var i=0; i<folders.length; i++) {
            folders[i].child = [];
            for(var j=0; j<subFolderArray.length; j++) {
                if (subFolderArray[j].parents[0].id == folders[i].id) {
                    folders[i].child.push(subFolderArray[j]);
                }
            }
        }
        for(var i=0; i<folders.length; i++) {
            for(var k=0; k<folders.length; k++) {
                if(folders[k].parents[0].id == folders[i].id)
                {
                    folders[i].child.push(folders[k])
                }
            }
        }
        for(var i=0; i<folders.length; i++) {
            if(folders[i].parents[0].isRoot)
            {
                topFolder.push(folders[i]);
                googleFileDetails = googleFileDetails.sort(classObj.compareFiles);
                topFolder = topFolder.sort(classObj.compareFiles);
                classObj.googleDriveFiles = topFolder.concat(googleFileDetails);
                classObj.cloudservice.googleDriveFolderLevel.push(classObj.googleDriveFiles);
                /*classObj.cloudservice.googleDriveFolderLevel.push(classObj.googleDriveFiles);*/
            }
        }
    }

    compareFiles(item1, item2) {
        if (item1.title.toLowerCase() < item2.title.toLowerCase()) {
            return -1;
        }
        if (item1.title.toLowerCase() > item2.title.toLowerCase()) {
            return 1;
        }
        return 0;
    }

    readGoogleDrive(file) {
        this.dataservice.csvHeader = [];
        if(file.mimeType == 'text/csv') {
            var downloadUrl = "https://www.googleapis.com/drive/v3/files/"+file.id+"?alt=media";
            if (downloadUrl) {
                var accessToken = classObj.googleDriveToken.access_token;
                var xhr = new XMLHttpRequest();
                xhr.open('GET', downloadUrl);
                xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
                xhr.responseType = "blob";
                xhr.onload = function() {
                    var reader = new FileReader();
                    reader.readAsText(this.response, "UTF-8");
                    reader.onload = function (evt) {
                        var csv = evt.target.result;
                        var allTextLines = csv.split(/\r\n|\n/);
                        classObj.dataservice.csvHeader =allTextLines[0].split(',');
                    }
                    reader.onerror = function(evt) {
                        if(evt.target.error.name == "NotReadableError") {
                            alert("Can not read file !");
                        }
                    }
                };
                xhr.onerror = function() {
                    alert("Download failure.");
                };
                xhr.send();
            }
            else {
                alert("Unable to download file.");
            }
        } else {
            classObj.dataservice.csvHeader.push("null");
        }
    }

    /*uploadGoogleDrive(csv) {debugger;
        var file = csv.target.files[0];*/
        /*var index = classObj.googleDriveFolderLevel.length-1;
        var folderId, folderLocation;
        if(index == 0)
        {
            var rootArray = classObj.googleDriveFolderLevel[index];
            folderLocation = rootArray[0];
            folderId = folderLocation.parents[0].id;
        }
        else{
            folderLocation = classObj.googleDriveFolderLevel[index];
            folderId = folderLocation.id;
        }

        var params =  {
            convert: false,
            ocr: false,
            uploadType: 'resumable'
        }
        var metadata = {
            'title': file.name,
            'mimeType': file.type || 'application/octet-stream',
            "parents": [{
                "kind": "drive#file",
                "id": folderId
            }]
        };
        var url = classObj.buildUrl_(params);
        var accessToken = classObj.googleDriveToken.access_token;
        var fileSize = file.size;
        var contentType = file.type || 'application/octet-stream';
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('X-Upload-Content-Length', fileSize);
        xhr.setRequestHeader('X-Upload-Content-Type', contentType);

        xhr.onload = function (e) {
            if (e.target.status < 400) {
                var location = e.target.getResponseHeader('Location');
                classObj.sendFile_(file,location);
            } else {
                console.log(e);
            }
        };
        xhr.onerror = function() {
            alert("Download failure.");
        };
        xhr.send(JSON.stringify(metadata));*/
    /*}*/

    /*buildUrl_(params) {
        var url = 'https://www.googleapis.com/upload/drive/v2/files/';
        var query = classObj.buildQuery_(params);
        if (query) {
            url += '?' + query;
=======
>>>>>>> 9e48393169b4aafcd2ca67371f377e7211bb044e
        }
        return url;
    }

    buildQuery_(params) {
        params = params || {};
        return Object.keys(params).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        }).join('&');
    }

    sendFile_(file,url) {
        var content = file;
        var end = file.size;
        var chunkSize = 0, offset = 0;

        if (chunkSize) {
                end = Math.min(offset + chunkSize, file.size);
            }
            content = content.slice(offset, end);

        var xhr = new XMLHttpRequest();
        xhr.open('PUT', url, true);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.setRequestHeader('Content-Range', "bytes " + offset + "-" + (end - 1) + "/" + file.size);
        xhr.setRequestHeader('X-Upload-Content-Type', file.type);
        xhr.onload = function() {debugger;
            console.log("Success");
        };
        xhr.onerror = function() {
            alert("Upload failure.");
        };
        xhr.send(content);
    }*/

    displayChild(file){
        classObj.googleDriveFiles = [];
        var fileIndex = classObj.cloudservice.googleDriveFolderLevel.indexOf(file);
        if(fileIndex == 0)
        {
            classObj.googleDriveFiles = file;
            classObj.cloudservice.googleDriveFolderLevel = [];
            classObj.cloudservice.googleDriveFolderLevel.push(file)
        }
        else
        {
            classObj.googleDriveFiles = file.child;
            if(fileIndex != -1) {
                classObj.cloudservice.googleDriveFolderLevel = classObj.cloudservice.googleDriveFolderLevel.slice(0, fileIndex + 1);
            }
            else{
                classObj.cloudservice.googleDriveFolderLevel.push(file);
            }
        }
        var folders = [];
        var files = [];
        for(var i=0; i<classObj.googleDriveFiles.length; i++) {
            if(classObj.googleDriveFiles[i].mimeType == 'application/vnd.google-apps.folder')
            {
                folders.push(classObj.googleDriveFiles[i]);
            }
            else {
                files.push(classObj.googleDriveFiles[i]);
            }
        }
        if(folders.length && files.length)
        {
            files = files.sort(classObj.compareFiles);
            folders = folders.sort(classObj.compareFiles);
            classObj.googleDriveFiles = folders.concat(files);
        }
        else{
            if(folders.length && !files.length)
            {
                folders = folders.sort(classObj.compareFiles);
                classObj.googleDriveFiles = folders;
            }
            else if(!folders.length && files.length){
                files = files.sort(classObj.compareFiles);
                classObj.googleDriveFiles = files;
            }
        }
    }

    signOutGoogleDrive() {debugger;
        var picker = new GoogleDriveApi({
            apiKey: 'AIzaSyAmOK6hQtmjXcUi5veiLnUU_1FTVyeT0RA',
            clientId: '400146389131-4b28l91a5r08e088i1o923tll9crl757',
            buttonEl: null,
            signOutEl: document.getElementById('google-drive-logout'),
            onSelect: function (file) {debugger;
                console.log("Sign Out");
                console.log(file);
            }
        });
    }
}
