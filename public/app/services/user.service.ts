/**
 * Created by aasheesh on 5/1/17.
 */

import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import 'rxjs/add/operator/map';

import { Http, Response } from '@angular/http'

/*declare var Auth0:any;*/
@Injectable()
export class UserService {
    UserDetails:any


    constructor(private http:Http, private router:Router) {
        this.UserDetails = {};
        if(localStorage.getItem("userdetails")) {
            this.UserDetails = JSON.parse(localStorage.getItem("userdetails"));
        }
        console.log("constructor called.....");

    }

   /* auth0 = new Auth0({
        domain: 'testsales.auth0.com',
        clientID: 'A6ZhMwI4BfM6rC8G01iii4HEH5H51ysE',
        responseType: 'token',
        callbackURL: 'http://localhost:3000/api/login/callback?state=viewmapping',
    });*/

    canActivate(route:ActivatedRouteSnapshot, state:RouterStateSnapshot) {

       /* let classObj = this;
       // var result = this.auth0.parseHash(window.location.hash);
        console.log("result is " + JSON.stringify(result));
        this.auth0.getProfile(result.idToken, function (err:any, profile:any) {
            // normalized attributes from Auth0
            if (err) {
                alert("Login Error......");
                console.log("err in getProfile is " + err);
            }
            if (profile) {
                console.log("profile is " + JSON.stringify(profile, null, 2));
                classObj.getUser(profile).map(res=> res.json()).subscribe(res=> {
                    classObj.UserDetails = res;
                    localStorage.setItem("userdetails", JSON.stringify(res));
                    //classObj.router.navigateByUrl('/configuration');
                    classObj.router.navigateByUrl('/import');
                    return false;
                })

            }
        });

        // not logged in so redirect to login page with the return url
        //this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
        //return false;*/
    }

    getClientConfig() {
        console.log("userdetails are " + JSON.stringify(this.UserDetails, null, 2));
        if (this.UserDetails.config) {
            return this.UserDetails.config.client;
        } else {
            return null;
        }

    }

    getSalesConfig() {
        if (this.UserDetails.config) {
            return this.UserDetails.config.sales;
        } else {
            return null;
        }

    }

    getUser(credentials:any) {

        return this.http.post('/api/login', credentials);

    }

    sociallogout() {
        return this.http.get('https://testsales.auth0.com/v2/logout?returnTo=http%3A%2F%2Flocalhost%3A3000&client_id=A6ZhMwI4BfM6rC8G01iii4HEH5H51ysE');
    }

    isUserLoggedIn() {
        return this.http.get('http://localhost:3000/api/authorize');
    }


}

