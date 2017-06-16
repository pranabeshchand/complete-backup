/**
 * Created by aasheesh on 10/1/17.
 */

import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../services/user.service';
import { Observable } from 'rxjs';


import { tokenNotExpired } from 'angular2-jwt';
import * as moment from 'moment';
import * as timezone from 'timezone';

// Avoid name not found warnings
declare var Auth0Lock:any;
var classObj:any

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router:Router, private userservice:UserService) {
        classObj = this;
        //console.log("timezones are " + moment.tz.names());
        console.log("timezones are " + timezone.tz.guess());
    }

    canActivate(route:ActivatedRouteSnapshot, state:RouterStateSnapshot):Observable<boolean>|boolean {

       return this.userservice.isUserLoggedIn().map(res=> {
           //alert(res.loggedIn);
           if (res.json().loggedIn) {
               alert(res.json().loggedIn);
               classObj.userservice.UserDetails = res.json().user;
               console.log("userdetails are " + JSON.stringify(classObj.userservice.UserDetails,null,2));
               return true;
           } else {
               alert(res.json().loggedIn)
               classObj.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
               return false;
           }
       })


    }

}