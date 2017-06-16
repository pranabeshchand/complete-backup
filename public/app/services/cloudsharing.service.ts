import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DataService } from './data.service';

let classObj:any
@Injectable()
export class CloudService {
    dropboxAccountDetails:Object;
    dropboxUsers:Array;
    fileDetails:Array;
    dropboxFiles:Array;
    googleDriveToken:Object;
    googleDriveFolderLevel:Array;
    client:Object;
    folderLevelList:Array;
    dropbox_token:any;

    constructor(private sanitizer:DomSanitizer, private dataservice: DataService) {
        classObj = this;
        this.sanitizer = sanitizer;
        this.dropboxAccountDetails = {};
        this.googleDriveToken = {};
        this.googleDriveFolderLevel = [];
        this.dropboxUsers = [];
        this.fileDetails = [];
        this.dropboxFiles = [];
        this.folderLevelList =[];
        this.dropbox_token = null;
        this.client = new Dropbox.Client({ key: 'f1efgo23zeuqva8',secret: "4r5x49rd44r3hhv"});
        if(JSON.parse(localStorage.getItem("dropboxUsers")) && JSON.parse(localStorage.getItem("dropboxUsers"))[0]){
            this.dropboxUsers = JSON.parse(localStorage.getItem("dropboxUsers"));
            this.changeDropboxUser(this.dropboxUsers[0]);
        }
    }



    signInDropbox() {
      /* this.dataservice.dropboxConnection().map(res=> res.json()).subscribe(res=> {
           console.log("response is " + JSON.stringify(res,null,2));
       })*/

        function getAccountInfo() {
            classObj.client.getAccountInfo(function(error, accountInfo) {
                if (error) {
                    classObj.signInDropbox();
                }
                if(classObj.dropboxUsers && classObj.dropboxUsers.length>0) {
                    for(var a=0; a<classObj.dropboxUsers.length; a++) {
                        var userAlreadyPresent = false;
                        if(classObj.dropboxUsers[a].email.toLowerCase() == accountInfo.email) {
                            userAlreadyPresent = true;
                            classObj.changeDropboxUser(classObj.dropboxUsers[a]);
                            break;
                        }
                        if (a == classObj.dropboxUsers.length-1 && !userAlreadyPresent) {
                            setAccountDetails();
                        }
                    }
                } else {
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


    }


    readDir(data) {
debugger;
        classObj.dropboxFiles = data.data.contents;
        var filesLength = classObj.dropboxFiles.length;
        var fileDetails = []
        var subFolderArray = [];

        for(var i=0; i<filesLength; i++) {
            if(classObj.dropboxFiles[i].path.lastIndexOf('/') == 0) {
                classObj.dropboxFiles[i].name = classObj.dropboxFiles[i].path.substring(1,classObj.dropboxFiles[i].path.length)
                fileDetails.push(classObj.dropboxFiles[i]);
            } else {
                classObj.dropboxFiles[i].name = classObj.dropboxFiles[i].path.substring(1,classObj.dropboxFiles[i].path.length)
                subFolderArray.push(classObj.dropboxFiles[i]);
            }
        }

        classObj.dataListSorting(fileDetails, subFolderArray);

    }

    showError(error) {
        console.log("Error: "+error)
    }

    getFolderLevel(list, name) {
        var obj = [];
        for(var i=0; i<list.length; i++) {
            if(list[i].path.indexOf(name) != -1) {
                var filePath = name+'/'+list[i].stat.name;
                if(list[i].path.toLowerCase() == filePath.toLowerCase()) {
                    obj.push(list[i]);
                }
            }
        }
        return obj;
    }

    compareFiles(item1, item2) {
        if (item1.stat.name < item2.stat.name) {
            return -1;
        }
        if (item1.stat.name > item2.stat.name) {
            return 1;
        }
        return 0;
    }

    getChildLevels(map, subFolderArray) {
        var dir = map;
        var dirPath = '';
        var objArr = [];
        for (var x = 1; x < dir.length-1; x++) {
            dirPath = dirPath + '/' + dir[x];
            objArr.push(classObj.getFolderLevel(subFolderArray, dirPath));
        }

        for (var y = objArr.length - 1; y > 0; y--) {

            objArr[y].forEach(function(child){
                var childPath = child.path.substring(0, child.path.lastIndexOf('/'));
                objArr[y-1].forEach(function(parent){
                    if(parent.stat.isFolder && parent.path.toLowerCase() == childPath.toLowerCase()) {
                        if(!parent.child){
                            parent.child = [];
                        }
                        parent.child.push(child);
                    }
                })
            })
        }

        return objArr[0];
    }

    dataListSorting(fileDetails, subFolderArray) {
        var isFile = [];
        var isFolder = [];

        fileDetails.forEach(function(file, index, array){
            if(file.is_dir) {
                isFolder.push(file);

            } else {
                isFile.push(file);
            }
        })


            arrangeInOrder();

        function arrangeInOrder(){
            if(subFolderArray) {
                for(var z=0; z<isFolder.length; z++) {
                    var rootFolder =  isFolder[z].path;
                    isFolder[z].child = [];
                    var dirLevel = [];
                    for(var k=0; k<subFolderArray.length; k++) {
                        if(subFolderArray[k].path.indexOf(rootFolder) != -1) {
                            var dir = subFolderArray[k].path.split('/');
                            if(dir.length>dirLevel.length){
                                dirLevel = dir;
                            }
                        }
                    }

                    isFolder[z].child = classObj.getChildLevels(dirLevel, subFolderArray);
                }
            }

            if(isFile.length && isFolder.length) {
                isFile = isFile.sort(classObj.compareFiles);
                isFolder = isFolder.sort(classObj.compareFiles);
                fileDetails = isFolder.concat(isFile);
            }
            classObj.fileDetails = fileDetails;
            classObj.dropboxAccountDetails.fileDetails = fileDetails;
            if(subFolderArray){
                classObj.dropboxUsers.push(classObj.dropboxAccountDetails);
                localStorage.setItem("dropboxUsers", JSON.stringify(classObj.dropboxUsers));
                classObj.changeDropboxUser(classObj.dropboxAccountDetails);
                //classObj.client.signOut();
            } else {
                classObj.folderLevelList.push(classObj.fileDetails);
            }
            classObj.showFileLoader = false;
        }
    }

    displayChilds(file) {
        classObj.dropboxFileDestination = file.path;
        classObj.fileDetails = [];
        classObj.showFileLoader = true;
        var fileIndex = this.folderLevelList.indexOf(file);
        if(fileIndex != -1) {
            this.folderLevelList = this.folderLevelList.slice(0, fileIndex+1);
        } else {
            this.folderLevelList.push(file);
        }

        if(fileIndex == 0) {
            classObj.dataListSorting(file);
        } else {
            if(!file.child){
                file.child = [];
            }
            classObj.dataListSorting(file.child);
        }
    }

    backToFolderLevel(level) {
        classObj.displayChilds(level);
    }


    signOutDropbox() {
        this.dropboxAccountDetails = {};
        this.fileDetails = [];
        this.folderLevelList = [];
        if(classObj.dropboxUsers && classObj.dropboxUsers.length>0) {
            for(var i=0; i<classObj.dropboxUsers.length; i++) {
                if(classObj.dropboxUsers[i].email.toLowerCase() == classObj.selectedDropboxUser.email.toLowerCase()) {
                    var user = classObj.dropboxUsers[i];
                    this.client = new Dropbox.Client({ token: user.access_token});
                    this.client.signOut();
                    classObj.dropboxUsers.splice(i, 1);
                    break;
                }
            }
            localStorage.setItem("dropboxUsers", JSON.stringify(classObj.dropboxUsers));
        }
    }

    /*uploadDropboxFile() {
        var fileInput = document.getElementById('file-upload');
        var file = fileInput.files[0];
        var path = "/sourabh/def/"+file.name;
        classObj.client._writeFileUsingPut(path,file,function(error, entries) {
            if (error) {
                return classObj.showError(error);
            }
            var uploadResult = entries;
        });
    }*/


}
