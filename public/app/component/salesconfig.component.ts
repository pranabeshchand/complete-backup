/**
 * Created by aasheesh on 3/1/17.
 */

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';
import { UserService } from '../services/user.service';


@Component({

    templateUrl: './app/templates/salesconfig.html'
})

export class SalesConfigComponent implements OnInit {

    salesconfig:any;
    salesConfigForm:FormGroup;
    submitted:boolean;
    testcompleted:boolean;

    constructor(private userservice:UserService, private formBuilder:FormBuilder, private dataservice:DataService, private router:Router) {
        // this.salesconfig = userservice.getSalesConfig();
        this.submitted = false;
    }


    ngOnInit() {
        this.salesconfig = this.userservice.getSalesConfig();
        this.salesConfigForm = this.formBuilder.group({
            salesforce_login: [this.salesconfig ? this.salesconfig.salesforce_login : '', Validators.required],
            username: [this.salesconfig ? this.salesconfig.username : "", Validators.required],
            password: [this.salesconfig ? this.salesconfig.password : "", Validators.required],

        });
        /* this.salesConfigForm = this.formBuilder.group({
         salesforce_login: ['',Validators.required],
         username: ['',Validators.required],
         password: ['',Validators.required],

         });*/

    }


    saveSalesConfig() {
        // alert("called");
        let classObj = this;
        this.submitted = true;

        if (this.salesConfigForm.valid) {
            let salesConfigData:any
            try {
                salesConfigData = {
                    sales: {
                        salesforce_login: this.salesConfigForm.controls['salesforce_login'].value,
                        username: this.salesConfigForm.controls['username'].value,
                        password: this.salesConfigForm.controls['password'].value
                    }
                }
            }
            catch (e) {
                console.log("exception is " + e);
            }

            this.dataservice.saveConfiguration(salesConfigData).map(res=> res.json()).subscribe(function (result) {
                console.log("config saved to db" + result);
                classObj.userservice.UserDetails.config.sales = result.data.sales;
                classObj.router.navigateByUrl('/configuration');
            })
        } else {

        }


    }

    testsalesconnection() {
        this.testcompleted = false;
        let data = {
            loginUrl: this.salesConfigForm.controls['salesforce_login'].value,
            user: this.salesConfigForm.controls['username'].value,
            password: this.salesConfigForm.controls['password'].value
        }

        this.dataservice.testSalesforceConnection(data).map(res => res.json())
            .subscribe(res=> {
                this.testcompleted = true;
                alert(res.message)
            },
                err => {
                this.testcompleted = true;
                alert(err)
            }
        );
    }


}
