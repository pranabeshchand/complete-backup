/**
 * Created by aasheesh on 28/12/16.
 */

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';
import { UserService } from '../services/user.service';


@Component({
    selector: 'editconfig',
    templateUrl: './app/templates/clientconfig.html'
})

export class ClientConfigComponent implements OnInit {
    configForm: FormGroup;
    values: Array<Object>;
    clientconfig: any;
    submitted: boolean;

    constructor(private formBuilder:FormBuilder, private dataservice:DataService, private userservice:UserService, private router:Router) {
        //this.clientconfig = dataservice.getClientConfig();
        this.clientconfig = userservice.getClientConfig();
        this.submitted = false;
        console.log("in clientconfig " + JSON.stringify(this.clientconfig));
    }

    ngOnInit() {
        /* this.configForm = this.formBuilder.group({
         server_name: [this.clientconfig.server_name, Validators.required],
         username: [this.clientconfig.username, Validators.required],
         password: [this.clientconfig.password, Validators.required],
         db: [this.clientconfig.db, Validators.required]
         });*/

        this.configForm = this.formBuilder.group({
            server_name: [this.clientconfig ? this.clientconfig.server_name : '', Validators.required],
            db: [this.clientconfig ? this.clientconfig.db : '', Validators.required]
        });
    }

    saveClientconfig() {
        let classObj = this;
        this.submitted = true;
        if (this.configForm.valid) {
            let salesConfigData = {

                client: {
                    server_name: this.configForm.controls['server_name'].value,
                    db: this.configForm.controls['db'].value
                }

            }


            this.dataservice.saveConfiguration(salesConfigData).map(res=> res.json()).subscribe(function (result) {
                console.log("config saved to db" + JSON.stringify(result));
                try {
                    classObj.userservice.UserDetails.config.client = result.data.client;
                    classObj.router.navigateByUrl('/configuration');
                } catch (e) {
                    console.log("exception is " + e);
                }

            })
        } else {
            /* alert("invalid form...");*/
        }

    }

    testconnection() {
        this.submitted = true;
        if (this.configForm.valid) {
            var url = {
                server_name: this.configForm.controls['server_name'].value,
                dbname: this.configForm.controls['db'].value
            }
            this.dataservice.testconnectivity(url).map(res=> res.json()).subscribe(res=> alert(res.msg),
                    err=> console.log(JSON.stringify(err)));
        }

    }

}
