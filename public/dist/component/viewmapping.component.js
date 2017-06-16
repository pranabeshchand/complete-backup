"use strict";
/**
 * Created by aasheesh on 11/1/17.
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
/**
 * Created by aasheesh on 1/1/17.
 */
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var data_service_1 = require("../services/data.service");
var user_service_1 = require("../services/user.service");
var _ = require("lodash");
//import { TableData } from './table-data';
var classObj;
var ViewMappingComponent = (function () {
    function ViewMappingComponent(userservice, dataservice, router) {
        this.userservice = userservice;
        this.dataservice = dataservice;
        this.router = router;
        classObj = this;
        this.userDetails = userservice.UserDetails;
        this.waitForSalesObj = true;
        this.waitForSalesObj = true;
        this.salesObjects = [];
        this.mongoObjects = [];
        this.mongo = [];
        this.sales = [];
        this.clientObj = [];
        this.showheader = false;
        // this.currentMappingObj = {};
        this.UserMappingObj = userservice.UserDetails.mappings != null ? userservice.UserDetails.mappings : {};
        if (this.isEmpty(dataservice.currentMappingObj)) {
            for (var key in this.UserMappingObj) {
                dataservice.currentMappingObj[key] = this.UserMappingObj[key];
            }
        }
        console.log("currentmapping is " + JSON.stringify(dataservice.currentMappingObj, null, 2));
    }
    ViewMappingComponent.prototype.ngOnInit = function () {
        if (classObj.dataservice.taskexport) {
            this.showheader = false;
            classObj.dataservice.currentSalesObj = '';
            classObj.dataservice.salesListObjArray = '';
            classObj.dataservice.filterList = [];
            classObj.dataservice.selectedFields = [];
            classObj.dataservice.exportQuery = '';
        }
        else {
            this.showheader = true;
        }
        /*  var obj = {
              loginUrl: 'https://login.salesforce.com',
              user: 'hackthisfastagain@gmail.com',
              password: 'Angularjs@2x29CYJ09nU4dnjwCyPGeI7XE'
          }*/
        this.dataservice.getSalesforceObjects().map(function (res) { return res.json(); }).subscribe(function (res) {
            classObj.waitForSalesObj = false;
            classObj.salesObjects = res;
            console.log("salesobj is " + classObj.salesObjects.length);
            //console.log("salesobj are " + JSON.stringify(res,null,2));
        }, function (err) {
            classObj.waitForSalesObj = false;
            console.log("err " + err);
        });
        /* this.dataservice.getClientObjects().map(res=> res.json()).subscribe(function (res) {
                 classObj.waitForMongoObj = false;
                 classObj.mongoObjects = res;
                 //classObj.currentMongoObj = classObj.mongoObjects[0];
                 console.log("mongoObjects is " + classObj.mongoObjects);
             },
                 err=> {
                 classObj.waitForMongoObj = false;
                 console.log("err " + err)
             }
         );*/
        /*for (var key in this.dataservice.currentMappingObj) {
            this.mongo.push(key);
            let obj1 = this.dataservice.currentMappingObj[key];
            console.log("obj is " + JSON.stringify(obj1, null, 2));
            var val = [];
            for (var i = 0; i < obj1.length; i++) {
                val.push(obj1[i].object);
            }
            console.log("val is " + val, val.length);
            this.sales.push(val);
        }*/
        console.log("sales length is " + this.sales.length);
        console.log("mongo is " + this.mongo);
        console.log("sales is " + this.sales);
    };
    ViewMappingComponent.prototype.selectSalesObject = function (value) {
        this.dataservice.currentSalesObj = value;
        localStorage.setItem("currentSalesObj", this.dataservice.currentSalesObj);
    };
    ViewMappingComponent.prototype.editmapping = function (objname) {
        console.log("edit mapping called....");
        //this.notify.emit(objname);
    };
    /* gotoAttributeMapping(mindex, sindex) {
         //this.createMappingObj();
         var mongo = this.mongo[mindex];
         var salesobj = this.sales[mindex];
         var sales = salesobj[sindex]
         //this.router.navigateByUrl(['/attributemapping',mongo]);
         this.router.navigate(['/attributemapping', mongo, sales]);
     }*/
    /*  create() {
          //this.NumberOfTimes = new Array(1);
          this.addmore();
      }*/
    ViewMappingComponent.prototype.isEmpty = function (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    };
    /*addmore() {
        //this.NumberOfTimes.push('*');
        this.mongo.push('');
        //this.sales.push(['']);
        this.sales.push([this.salesObjects[0]]);
    }*/
    /* addsales(index:any) {
         // this.sales[index].push("");
         this.sales[index].push(this.salesObjects[0]);
 
     }*/
    /*removesales(mindex:any, sindex:any) {
        this.sales[mindex].splice(sindex, 1);
        if (this.sales[mindex].length == 0) {
            this.mongo.splice(mindex, 1);
            this.sales.splice(mindex, 1);
        }
    }*/
    /* remove(index:any) {
     this.NumberOfTimes.splice(index, 1);
     this.mongo.splice(index, 1);
     this.sales.splice(index, 1);
     }*/
    ViewMappingComponent.prototype.saveMapping = function () {
        var classObj = this;
        var userdetails = JSON.parse(localStorage.getItem("userdetails"));
        if (this.isEmpty(this.dataservice.currentMappingObj)) {
            alert("Nothing to save.");
        }
        else {
            var obj = {
                mappingobj: this.dataservice.currentMappingObj,
                username: this.userservice.UserDetails.username
            };
            this.dataservice.saveObjectMapping(obj).map(function (res) { return res.json(); }).subscribe(function (res) {
                console.log(res);
                classObj.userservice.UserDetails.mappings = res.data.mappingobj;
                for (var key in classObj.userservice.UserDetails.mappings) {
                    classObj.dataservice.currentMappingObj[key] = classObj.userservice.UserDetails.mappings[key];
                }
                localStorage.setItem("userdetails", JSON.stringify(classObj.userservice.UserDetails));
                alert("mapping saved...");
            }, function (err) { return console.log(err); });
        }
    };
    /* salesChange(mindex:any, sindex:any, value:any) {
         var val = this.sales[mindex];
         val[sindex] = value;
         if (this.sales.indexOf(val) == -1) {
             this.sales[mindex] = val;
         }
 
     }*/
    ViewMappingComponent.prototype.removeDuplicates = function (arr) {
        var uniquearray = [];
        for (var i = 0; i < arr.length; i++) {
            if (arr.indexOf(arr[i]) == i) {
                uniquearray.push(arr[i]);
            }
        }
        console.log(uniquearray);
        return uniquearray;
    };
    ViewMappingComponent.prototype.createMappingObj = function () {
        this.dataservice.currentMappingObj = {};
        for (var i = 0; i < this.mongo.length; i++) {
            var val = this.dataservice.currentMappingObj[this.mongo[i]];
            if (val) {
                var value = this.sales[i];
                for (var j = 0; j < value.length; j++) {
                    console.log("in if val is " + val);
                    val.push({ object: value[j], attributes: {} });
                }
                if (val != "" && val != null && this.mongo[i] != "" && this.mongo[i] != null) {
                    var newarr = _.uniqBy(val, 'object');
                    this.dataservice.currentMappingObj[this.mongo[i]] = newarr;
                }
            }
            else {
                if (this.sales[i] != "" && this.sales[i] != null && this.mongo[i] != "" && this.mongo[i] != null) {
                    var arr = [];
                    // var newarr = this.removeDuplicates(this.sales);
                    for (var k = 0; k < this.sales[i].length; k++) {
                        console.log("in else arr is " + JSON.stringify(arr, null, 2));
                        arr.push({ object: this.sales[i][k], attributes: {} });
                    }
                    var newarr = _.uniqBy(arr, 'object');
                    this.dataservice.currentMappingObj[this.mongo[i]] = newarr;
                }
            }
        }
        console.log("while saving " + JSON.stringify(this.dataservice.currentMappingObj, null, 2));
    };
    ViewMappingComponent.prototype.saveObjMapping = function () {
        this.createMappingObj();
        this.saveMapping();
    };
    return ViewMappingComponent;
}());
ViewMappingComponent = __decorate([
    core_1.Component({
        selector: 'viewmapping',
        templateUrl: './app/templates/viewmapping.html',
    }),
    __metadata("design:paramtypes", [user_service_1.UserService, data_service_1.DataService, router_1.Router])
], ViewMappingComponent);
exports.ViewMappingComponent = ViewMappingComponent;
//# sourceMappingURL=viewmapping.component.js.map