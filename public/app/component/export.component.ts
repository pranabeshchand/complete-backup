/**
 * Created by aasheesh on 22/3/17.
 */


import { Component, OnInit, OnDestroy } from '@angular/core';
import { Export2Component } from './export2.component'
import { AttributeMappingComponent } from './attributemapping.component'
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { DataService } from '../services/data.service';
import { PopoverModule } from 'ngx-popover';
import * as jsep from "jsep";


let classObj:any
@Component({
    templateUrl: './app/templates/export.html'

})

export class ExportComponent implements OnInit, OnDestroy {
    salesobj:string
    query: string

    constructor(private route:ActivatedRoute, private dataservice:DataService, private userservice:UserService, private router:Router) {
        classObj = this;
        this.query = '';
        classObj.dataservice.step = 1;
    }

    ngOnInit() {
        if(!this.dataservice.currentSalesObj) {
            this.salesobj = this.dataservice.currentSalesObj = localStorage.getItem("currentSalesObj");
        }

        if(this.router.url === '/export'  || this.router.url.indexOf('/export') != -1) {
            classObj.dataservice.taskexport = true;
        } else {
            classObj.dataservice.taskexport = false;
        }
        this.dataservice.getSalesAttributes(this.salesobj).map(res=> res.json()).subscribe(function (res) {

            classObj.salesAttribute = res;
            classObj.query = 'SELECT FROM '+ classObj.salesAttribute;
           // console.log("sales attribute are " + JSON.stringify(classObj.salesAttribute, null, 2));
        },
        err=> {
            console.log("err " + err);
        });

        if(!this.isAuthenticated()) {
            classObj.dataservice.activePanel = 'mycomputer';
        }

    }

    insert(str, index, value) {
        return str.substr(0, index) + value + str.substr(index);
    }

    dataQuery(str, value) {
        var tempstr = '';
        if (str.indexOf(value) == -1) {
            var index = str.indexOf('from');
            console.log("index is " + index);
            if (index == 7) {
                tempstr = this.insert(str, index - 1, ' ' + value + '');
            } else {
                tempstr = this.insert(str, index - 1, ',' + value + '');
            }

        } else {
            var index = str.indexOf(value);

            if (str.indexOf(',' + value) > -1) {
                tempstr = str.replace(',' + value, '');
            }
            if (str.indexOf(value + ',') > -1) {
                tempstr = str.replace(value + ',', '');
            }
            if (str.indexOf(',' + value) == -1 && str.indexOf(value + ',') == -1) {
                tempstr = str.replace(value, '');
            }

        }
        console.log(tempstr);
        return tempstr;
    }

    getAccessTokenFromUrl() {
        if(window.location.hash) {
            var access_token = utils.parseQueryString(window.location.hash).access_token;
            classObj.dataservice.step = 3;
            classObj.dataservice.activePanel = 'dropbox';
            return access_token;
        }
    }

    isAuthenticated() {
        return !!classObj.getAccessTokenFromUrl();
    }
}
