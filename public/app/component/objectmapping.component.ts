/**
 * Created by aasheesh on 1/1/17.
 */

import { Component, OnInit, Input, NgZone } from '@angular/core';
import { ViewMappingComponent } from './viewmapping.component'
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { UserService } from '../services/user.service';

@Component({
    templateUrl: './app/templates/objectmapping.html',
    styleUrls: ['./app/styles/css/objectmapping.css']
})

export class ObjectMappingComponent implements OnInit {
    mongoObjects:Array<string>
    salesObjects:Array<string>
    mappingObj:any
    currentMongoObj:any
    selectedSalesObj:Array<string>
    checkboxValues:Array<boolean>
    UserMappingObj:any
     waitForSalesObj:boolean
     waitForMongoObj:boolean
    currentMappingObj:any


   // static myclassobj: ObjectMappingComponent;

    constructor(private dataservice:DataService, private userservice:UserService, private router: Router, private _ngZone: NgZone ) {
       // ObjectMappingComponent.myclassobj = this;
        this.mongoObjects = [];
        this.salesObjects = [];
        this.waitForSalesObj = true;
        this.waitForMongoObj = true;
        this.selectedSalesObj = [];
        this.mappingObj = {};
        this.currentMappingObj = {};
        this.UserMappingObj = userservice.UserDetails.mapping != null ? userservice.UserDetails.mapping.objMapping : {}

        for(let key in this.UserMappingObj) {
            this.currentMappingObj[key] = this.UserMappingObj[key];
        }


        console.log("usermapping is " + JSON.stringify(this.UserMappingObj));
        console.log("currentMappingObj is " + JSON.stringify(this.currentMappingObj));
        this.checkboxValues = [];

    }

    ngOnInit() {
        let classObj = this;

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
        }

        this.dataservice.getSalesforceObjects(obj).map(res=>res.json()).subscribe(function(res) {
                classObj.waitForSalesObj = false;
                classObj.salesObjects = res;
                console.log("salesobj is "+   classObj.salesObjects.length);
               /* if(classObj.UserMappingObj[classObj.currentMongoObj]) {
                    let sales = classObj.UserMappingObj[classObj.currentMongoObj]
                    classObj.selectedSalesObj = sales;
                    for (let i = 0; i < sales.length; i++) {
                        classObj.checkboxValues[classObj.salesObjects.indexOf(sales[i])] = true;

                    }
                }*/
                if(classObj.currentMappingObj[classObj.currentMongoObj]) {
                    let sales = classObj.currentMappingObj[classObj.currentMongoObj]
                    classObj.selectedSalesObj = sales;
                    for (let i = 0; i < sales.length; i++) {
                        classObj.checkboxValues[classObj.salesObjects.indexOf(sales[i])] = true;

                    }
                }
            },
                err=> {
                    classObj.waitForSalesObj = false;
                    console.log("err " + err)
                }
    );

        this.dataservice.getClientObjects().map(res=> res.json()).subscribe(function(res) {
                classObj.waitForMongoObj = false;
                classObj.mongoObjects = res;
                classObj.currentMongoObj = classObj.mongoObjects[0];
                console.log("mongoObjects is "+   classObj.mongoObjects);
            },
                err=> {
                    classObj.waitForMongoObj = false;
                    console.log("err " + err)
                }
        );

    }

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
    mapToSales(mongoobj:any) {
        this.currentMongoObj = mongoobj;

        console.log(" current mongoobj obj is " + this.currentMongoObj);
        this.selectedSalesObj = [];
        this.checkboxValues = [];
        if(this.currentMappingObj[this.currentMongoObj]) {
            let sales = this.currentMappingObj[this.currentMongoObj]
            this.selectedSalesObj = sales;
            for (let i = 0; i < sales.length; i++) {
                this.checkboxValues[this.salesObjects.indexOf(sales[i])] = true;

            }
        }

    }
    onnotify($event: any) {
        this.mapToSales($event);
    }

    selectedSalesObjects(val:any) {

         var index = this.selectedSalesObj.indexOf(val);
         if (index > -1) {
         this.selectedSalesObj.splice(index, 1);
         } else {
         this.selectedSalesObj.push(val);
         }

        if (this.selectedSalesObj.length > 0) {
           // this.UserMappingObj[this.currentMongoObj] = this.selectedSalesObj;
            this.currentMappingObj[this.currentMongoObj] = this.selectedSalesObj;
        } else {
            /*if(this.UserMappingObj[this.currentMongoObj]) {
                delete this.UserMappingObj[this.currentMongoObj]
            }*/
            if(this.currentMappingObj[this.currentMongoObj]) {
                delete this.currentMappingObj[this.currentMongoObj]
            }
        }
        console.log("currentMappingObj obj is " + JSON.stringify(this.currentMappingObj, null, 2));
 }
    isEmpty(obj: any) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

    saveMapping() {
        let classObj = this;
        let userdetails = JSON.parse(sessionStorage.getItem("userdetails"));
        if(this.isEmpty(this.currentMappingObj)) {
            alert("Nothing to save.")
        } else {
            /*let obj = {
                mappingobj:this.UserMappingObj,
                username: this.userservice.UserDetails.username
            }*/
            let obj = {
                mappingobj:this.currentMappingObj,
                username: this.userservice.UserDetails.username
            }
            this.dataservice.saveObjectMapping(obj).map(res=> res.json()).subscribe(res=> {
                    console.log(res);
                    classObj.userservice.UserDetails.mapping.objMapping = res.data.mappingobj;

                   /* classObj._ngZone.run(() => {
                        for(let key in classObj.userservice.UserDetails.mapping.objMapping) {
                            classObj.currentMappingObj[key] = classObj.userservice.UserDetails.mapping.objMapping[key];
                        }
                    })*/

                    console.log("currentmapping after save is " + JSON.stringify(classObj.currentMappingObj,null,2));

                    sessionStorage.setItem("userdetails", JSON.stringify(classObj.userservice.UserDetails));
                    console.log("after save userdetails " + JSON.stringify(classObj.userservice.UserDetails,null,2));
                    alert("mapping saved...");
                },
                    err=> console.log(err)
            );
        }


    }
    changeMapping() {
        this.currentMappingObj = {
            user:['Account']
        }
    }

    showmapping() {
        this.router.navigateByUrl('/viewmapping');

    }

    setmarked(prop: any) {
        console.log("prop is " + JSON.stringify(this.currentMappingObj));
        if(this.currentMappingObj[prop]) {
            return true;
        }
        return false;
    }

}
