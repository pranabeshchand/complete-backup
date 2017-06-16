"use strict";
/**
 * Created by aasheesh on 1/1/17.
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
var router_1 = require("@angular/router");
var data_service_1 = require("../services/data.service");
var user_service_1 = require("../services/user.service");
var ObjectMappingComponent = (function () {
    // static myclassobj: ObjectMappingComponent;
    function ObjectMappingComponent(dataservice, userservice, router, _ngZone) {
        this.dataservice = dataservice;
        this.userservice = userservice;
        this.router = router;
        this._ngZone = _ngZone;
        // ObjectMappingComponent.myclassobj = this;
        this.mongoObjects = [];
        this.salesObjects = [];
        this.waitForSalesObj = true;
        this.waitForMongoObj = true;
        this.selectedSalesObj = [];
        this.mappingObj = {};
        this.currentMappingObj = {};
        this.UserMappingObj = userservice.UserDetails.mapping != null ? userservice.UserDetails.mapping.objMapping : {};
        for (var key in this.UserMappingObj) {
            this.currentMappingObj[key] = this.UserMappingObj[key];
        }
        console.log("usermapping is " + JSON.stringify(this.UserMappingObj));
        console.log("currentMappingObj is " + JSON.stringify(this.currentMappingObj));
        this.checkboxValues = [];
    }
    ObjectMappingComponent.prototype.ngOnInit = function () {
        var classObj = this;
        console.log("myobj is " + classObj);
        /* var obj = {
             loginUrl: this.userservice.UserDetails.config.sales.salesforce_login,
             user: this.userservice.UserDetails.config.sales.username,
             password: this.userservice.UserDetails.config.sales.password
         }*/
        var obj = {
            loginUrl: 'https://login.salesforce.com',
            user: 'hackthisfastagain@gmail.com',
            password: 'Angularjs@2x29CYJ09nU4dnjwCyPGeI7XE'
        };
        this.dataservice.getSalesforceObjects(obj).map(function (res) { return res.json(); }).subscribe(function (res) {
            classObj.waitForSalesObj = false;
            classObj.salesObjects = res;
            console.log("salesobj is " + classObj.salesObjects.length);
            /* if(classObj.UserMappingObj[classObj.currentMongoObj]) {
                 let sales = classObj.UserMappingObj[classObj.currentMongoObj]
                 classObj.selectedSalesObj = sales;
                 for (let i = 0; i < sales.length; i++) {
                     classObj.checkboxValues[classObj.salesObjects.indexOf(sales[i])] = true;

                 }
             }*/
            if (classObj.currentMappingObj[classObj.currentMongoObj]) {
                var sales = classObj.currentMappingObj[classObj.currentMongoObj];
                classObj.selectedSalesObj = sales;
                for (var i = 0; i < sales.length; i++) {
                    classObj.checkboxValues[classObj.salesObjects.indexOf(sales[i])] = true;
                }
            }
        }, function (err) {
            classObj.waitForSalesObj = false;
            console.log("err " + err);
        });
        this.dataservice.getClientObjects().map(function (res) { return res.json(); }).subscribe(function (res) {
            classObj.waitForMongoObj = false;
            classObj.mongoObjects = res;
            classObj.currentMongoObj = classObj.mongoObjects[0];
            console.log("mongoObjects is " + classObj.mongoObjects);
        }, function (err) {
            classObj.waitForMongoObj = false;
            console.log("err " + err);
        });
    };
    /*   mapToSales(mongoobj:any) {
           this.currentMongoObj = mongoobj;
   
           console.log(" current mongoobj obj is " + this.currentMongoObj);
           this.selectedSalesObj = [];
           this.checkboxValues = [];
           if(this.UserMappingObj[this.currentMongoObj]) {
               let sales = this.UserMappingObj[this.currentMongoObj]
               this.selectedSalesObj = sales;
               for (let i = 0; i < sales.length; i++) {
                   this.checkboxValues[this.salesObjects.indexOf(sales[i])] = true;
   
               }
           }
   
       }*/
    ObjectMappingComponent.prototype.mapToSales = function (mongoobj) {
        this.currentMongoObj = mongoobj;
        console.log(" current mongoobj obj is " + this.currentMongoObj);
        this.selectedSalesObj = [];
        this.checkboxValues = [];
        if (this.currentMappingObj[this.currentMongoObj]) {
            var sales = this.currentMappingObj[this.currentMongoObj];
            this.selectedSalesObj = sales;
            for (var i = 0; i < sales.length; i++) {
                this.checkboxValues[this.salesObjects.indexOf(sales[i])] = true;
            }
        }
    };
    ObjectMappingComponent.prototype.onnotify = function ($event) {
        this.mapToSales($event);
    };
    ObjectMappingComponent.prototype.selectedSalesObjects = function (val) {
        var index = this.selectedSalesObj.indexOf(val);
        if (index > -1) {
            this.selectedSalesObj.splice(index, 1);
        }
        else {
            this.selectedSalesObj.push(val);
        }
        if (this.selectedSalesObj.length > 0) {
            // this.UserMappingObj[this.currentMongoObj] = this.selectedSalesObj;
            this.currentMappingObj[this.currentMongoObj] = this.selectedSalesObj;
        }
        else {
            /*if(this.UserMappingObj[this.currentMongoObj]) {
                delete this.UserMappingObj[this.currentMongoObj]
            }*/
            if (this.currentMappingObj[this.currentMongoObj]) {
                delete this.currentMappingObj[this.currentMongoObj];
            }
        }
        console.log("currentMappingObj obj is " + JSON.stringify(this.currentMappingObj, null, 2));
    };
    ObjectMappingComponent.prototype.isEmpty = function (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    };
    ObjectMappingComponent.prototype.saveMapping = function () {
        var classObj = this;
        var userdetails = JSON.parse(sessionStorage.getItem("userdetails"));
        if (this.isEmpty(this.currentMappingObj)) {
            alert("Nothing to save.");
        }
        else {
            /*let obj = {
                mappingobj:this.UserMappingObj,
                username: this.userservice.UserDetails.username
            }*/
            var obj = {
                mappingobj: this.currentMappingObj,
                username: this.userservice.UserDetails.username
            };
            this.dataservice.saveObjectMapping(obj).map(function (res) { return res.json(); }).subscribe(function (res) {
                console.log(res);
                classObj.userservice.UserDetails.mapping.objMapping = res.data.mappingobj;
                /* classObj._ngZone.run(() => {
                     for(let key in classObj.userservice.UserDetails.mapping.objMapping) {
                         classObj.currentMappingObj[key] = classObj.userservice.UserDetails.mapping.objMapping[key];
                     }
                 })*/
                console.log("currentmapping after save is " + JSON.stringify(classObj.currentMappingObj, null, 2));
                sessionStorage.setItem("userdetails", JSON.stringify(classObj.userservice.UserDetails));
                console.log("after save userdetails " + JSON.stringify(classObj.userservice.UserDetails, null, 2));
                alert("mapping saved...");
            }, function (err) { return console.log(err); });
        }
    };
    ObjectMappingComponent.prototype.changeMapping = function () {
        this.currentMappingObj = {
            user: ['Account']
        };
    };
    ObjectMappingComponent.prototype.showmapping = function () {
        this.router.navigateByUrl('/viewmapping');
    };
    ObjectMappingComponent.prototype.setmarked = function (prop) {
        console.log("prop is " + JSON.stringify(this.currentMappingObj));
        if (this.currentMappingObj[prop]) {
            return true;
        }
        return false;
    };
    return ObjectMappingComponent;
}());
ObjectMappingComponent = __decorate([
    core_1.Component({
        templateUrl: './app/templates/objectmapping.html',
        styleUrls: ['./app/styles/css/objectmapping.css']
    }),
    __metadata("design:paramtypes", [data_service_1.DataService, user_service_1.UserService, router_1.Router, core_1.NgZone])
], ObjectMappingComponent);
exports.ObjectMappingComponent = ObjectMappingComponent;
//# sourceMappingURL=objectmapping.component.js.map