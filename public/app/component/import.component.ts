import { Component, OnInit, OnDestroy } from '@angular/core';
import { Export2Component } from './export2.component'
import { AttributeMappingComponent } from './attributemapping.component'
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { DataService } from '../services/data.service';

let classObj:any
@Component({
    templateUrl: './app/templates/import.html'

})

export class ImportComponent implements OnInit, OnDestroy {
    step:number

    constructor(private route:ActivatedRoute, private dataservice:DataService, private userservice:UserService, private router:Router) {
        classObj = this;
        if(router.url.indexOf('update') == -1) {
        classObj.dataservice.step = 1;
        }else{
            console.log("else mmmmmmmmmmmmmmmmmmmmmm");
        }
    }

    ngOnInit() {
        if(this.router.url === '/export' || this.router.url.indexOf('/export') != -1) {
            classObj.dataservice.taskexport = true;
        } else {
            classObj.dataservice.taskexport = false;
        }
        if(!this.isAuthenticated()) {
            classObj.dataservice.activePanel = 'mycomputer';
        }
    }


    getAccessTokenFromUrl() {
        if(window.location.hash) {
            var access_token = utils.parseQueryString(window.location.hash).access_token;
            classObj.dataservice.step = 2;
            classObj.dataservice.activePanel = 'dropbox';
            return access_token;
        }
    }

    isAuthenticated() {
        return !!classObj.getAccessTokenFromUrl();
    }
}
