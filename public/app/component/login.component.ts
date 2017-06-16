/**
 * Created by aasheesh on 6/1/17.
 */


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { DataService } from '../services/data.service';
import { AuthGuard } from '../services/auth.service';
import { Router } from '@angular/router';


@Component({
    templateUrl: './app/templates/login.html',
    styleUrls: ['./app/styles/css/login.css']
})

export class LoginComponent implements OnInit {

    loginForm:FormGroup;

    constructor(private userservice:UserService, private router:Router, private formBuilder:FormBuilder, private auth: AuthGuard, private dataservice: DataService) {

    }


    ngOnInit() {

        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    doLogin() {

    }
    PopupCenter(url, title, w, h) {
    // Fixes dual-screen position                         Most browsers      Firefox
    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;
    var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

    // Puts focus on the newWindow
    if (window.focus) {
        newWindow.focus();
    }
        return newWindow;
    }
    loginWithSalesforce(){

        var url = 'http://localhost:3000/import';
        //var win = window.open('http://localhost:3000/api/sflogin', '_blank', 'location=yes,left=500, width=500,height=800');
        var win = this.PopupCenter('http://localhost:3000/api/sflogin','Salesforce Login','800','600')
        var pollTimer = window.setInterval(function () {
            try {
                console.log("length" + win.document.URL.length);

                if (win.document.URL.indexOf(url) != -1) {
                    window.clearInterval(pollTimer);
                    win.close();
                    console.log("reload the page....")
                    //window.opener.location.reload();
                    window.location.href = "http://localhost:3000/import";

                }
            } catch (e) {
            }
        }, 100);
    }

}
