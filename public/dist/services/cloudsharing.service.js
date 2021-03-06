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
var platform_browser_1 = require("@angular/platform-browser");
var data_service_1 = require("./data.service");
var classObj;
var CloudService = (function () {
    function CloudService(sanitizer, dataservice) {
        this.sanitizer = sanitizer;
        this.dataservice = dataservice;
        classObj = this;
        this.sanitizer = sanitizer;
        this.dropboxAccountDetails = {};
        this.googleDriveToken = {};
        this.googleDriveFolderLevel = [];
        this.dropboxUsers = [];
        this.fileDetails = [];
        this.dropboxFiles = [];
        this.folderLevelList = [];
        this.dropbox_token = null;
        this.client = new Dropbox.Client({ key: 'f1efgo23zeuqva8', secret: "4r5x49rd44r3hhv" });
        if (JSON.parse(localStorage.getItem("dropboxUsers")) && JSON.parse(localStorage.getItem("dropboxUsers"))[0]) {
            this.dropboxUsers = JSON.parse(localStorage.getItem("dropboxUsers"));
            this.changeDropboxUser(this.dropboxUsers[0]);
        }
    }
    CloudService.prototype.signInDropbox = function () {
        /* this.dataservice.dropboxConnection().map(res=> res.json()).subscribe(res=> {
             console.log("response is " + JSON.stringify(res,null,2));
         })*/
        function getAccountInfo() {
            classObj.client.getAccountInfo(function (error, accountInfo) {
                if (error) {
                    classObj.signInDropbox();
                }
                if (classObj.dropboxUsers && classObj.dropboxUsers.length > 0) {
                    for (var a = 0; a < classObj.dropboxUsers.length; a++) {
                        var userAlreadyPresent = false;
                        if (classObj.dropboxUsers[a].email.toLowerCase() == accountInfo.email) {
                            userAlreadyPresent = true;
                            classObj.changeDropboxUser(classObj.dropboxUsers[a]);
                            break;
                        }
                        if (a == classObj.dropboxUsers.length - 1 && !userAlreadyPresent) {
                            setAccountDetails();
                        }
                    }
                }
                else {
                    setAccountDetails();
                }
                function setAccountDetails() {
                    classObj.dropboxAccountDetails = accountInfo;
                    classObj.dropboxAccountDetails.access_token = classObj.dropbox_token;
                    classObj.showFileLoader = true;
                    readDir();
                }
            });
        }
        /*   function readDir() {
               classObj.client.delta(function(error, entries) {
                   if (error) {
                       return classObj.showError(error);
                   }
                   classObj.dropboxFiles = entries.changes;
                   var filesLength = classObj.dropboxFiles.length;
                   var fileDetails = []
                   var subFolderArray = [];
   
                   for(var i=0; i<filesLength; i++) {
                       if(classObj.dropboxFiles[i].path.lastIndexOf('/') == 0) {
                           fileDetails.push(classObj.dropboxFiles[i]);
                       } else {
                           subFolderArray.push(classObj.dropboxFiles[i]);
                       }
                   }
   
                   classObj.dataListSorting(fileDetails, subFolderArray);
               });
           }*/
    };
    CloudService.prototype.readDir = function (data) {
        debugger;
        classObj.dropboxFiles = data.data.contents;
        var filesLength = classObj.dropboxFiles.length;
        var fileDetails = [];
        var subFolderArray = [];
        for (var i = 0; i < filesLength; i++) {
            if (classObj.dropboxFiles[i].path.lastIndexOf('/') == 0) {
                classObj.dropboxFiles[i].name = classObj.dropboxFiles[i].path.substring(1, classObj.dropboxFiles[i].path.length);
                fileDetails.push(classObj.dropboxFiles[i]);
            }
            else {
                classObj.dropboxFiles[i].name = classObj.dropboxFiles[i].path.substring(1, classObj.dropboxFiles[i].path.length);
                subFolderArray.push(classObj.dropboxFiles[i]);
            }
        }
        classObj.dataListSorting(fileDetails, subFolderArray);
    };
    CloudService.prototype.showError = function (error) {
        console.log("Error: " + error);
    };
    CloudService.prototype.getFolderLevel = function (list, name) {
        var obj = [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].path.indexOf(name) != -1) {
                var filePath = name + '/' + list[i].stat.name;
                if (list[i].path.toLowerCase() == filePath.toLowerCase()) {
                    obj.push(list[i]);
                }
            }
        }
        return obj;
    };
    CloudService.prototype.compareFiles = function (item1, item2) {
        if (item1.stat.name < item2.stat.name) {
            return -1;
        }
        if (item1.stat.name > item2.stat.name) {
            return 1;
        }
        return 0;
    };
    CloudService.prototype.getChildLevels = function (map, subFolderArray) {
        var dir = map;
        var dirPath = '';
        var objArr = [];
        for (var x = 1; x < dir.length - 1; x++) {
            dirPath = dirPath + '/' + dir[x];
            objArr.push(classObj.getFolderLevel(subFolderArray, dirPath));
        }
        for (var y = objArr.length - 1; y > 0; y--) {
            objArr[y].forEach(function (child) {
                var childPath = child.path.substring(0, child.path.lastIndexOf('/'));
                objArr[y - 1].forEach(function (parent) {
                    if (parent.stat.isFolder && parent.path.toLowerCase() == childPath.toLowerCase()) {
                        if (!parent.child) {
                            parent.child = [];
                        }
                        parent.child.push(child);
                    }
                });
            });
        }
        return objArr[0];
    };
    CloudService.prototype.dataListSorting = function (fileDetails, subFolderArray) {
        var isFile = [];
        var isFolder = [];
        fileDetails.forEach(function (file, index, array) {
            if (file.is_dir) {
                isFolder.push(file);
            }
            else {
                isFile.push(file);
            }
        });
        arrangeInOrder();
        function arrangeInOrder() {
            if (subFolderArray) {
                for (var z = 0; z < isFolder.length; z++) {
                    var rootFolder = isFolder[z].path;
                    isFolder[z].child = [];
                    var dirLevel = [];
                    for (var k = 0; k < subFolderArray.length; k++) {
                        if (subFolderArray[k].path.indexOf(rootFolder) != -1) {
                            var dir = subFolderArray[k].path.split('/');
                            if (dir.length > dirLevel.length) {
                                dirLevel = dir;
                            }
                        }
                    }
                    isFolder[z].child = classObj.getChildLevels(dirLevel, subFolderArray);
                }
            }
            if (isFile.length && isFolder.length) {
                isFile = isFile.sort(classObj.compareFiles);
                isFolder = isFolder.sort(classObj.compareFiles);
                fileDetails = isFolder.concat(isFile);
            }
            classObj.fileDetails = fileDetails;
            classObj.dropboxAccountDetails.fileDetails = fileDetails;
            if (subFolderArray) {
                classObj.dropboxUsers.push(classObj.dropboxAccountDetails);
                localStorage.setItem("dropboxUsers", JSON.stringify(classObj.dropboxUsers));
                classObj.changeDropboxUser(classObj.dropboxAccountDetails);
                //classObj.client.signOut();
            }
            else {
                classObj.folderLevelList.push(classObj.fileDetails);
            }
            classObj.showFileLoader = false;
        }
    };
    CloudService.prototype.displayChilds = function (file) {
        classObj.dropboxFileDestination = file.path;
        classObj.fileDetails = [];
        classObj.showFileLoader = true;
        var fileIndex = this.folderLevelList.indexOf(file);
        if (fileIndex != -1) {
            this.folderLevelList = this.folderLevelList.slice(0, fileIndex + 1);
        }
        else {
            this.folderLevelList.push(file);
        }
        if (fileIndex == 0) {
            classObj.dataListSorting(file);
        }
        else {
            if (!file.child) {
                file.child = [];
            }
            classObj.dataListSorting(file.child);
        }
    };
    CloudService.prototype.backToFolderLevel = function (level) {
        classObj.displayChilds(level);
    };
    CloudService.prototype.signOutDropbox = function () {
        this.dropboxAccountDetails = {};
        this.fileDetails = [];
        this.folderLevelList = [];
        if (classObj.dropboxUsers && classObj.dropboxUsers.length > 0) {
            for (var i = 0; i < classObj.dropboxUsers.length; i++) {
                if (classObj.dropboxUsers[i].email.toLowerCase() == classObj.selectedDropboxUser.email.toLowerCase()) {
                    var user = classObj.dropboxUsers[i];
                    this.client = new Dropbox.Client({ token: user.access_token });
                    this.client.signOut();
                    classObj.dropboxUsers.splice(i, 1);
                    break;
                }
            }
            localStorage.setItem("dropboxUsers", JSON.stringify(classObj.dropboxUsers));
        }
    };
    return CloudService;
}());
CloudService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [platform_browser_1.DomSanitizer, data_service_1.DataService])
], CloudService);
exports.CloudService = CloudService;
//# sourceMappingURL=cloudsharing.service.js.map