/**
 * Created by aasheesh on 30/12/16.
 */

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { Observable } from "rxjs";

@Component({

    templateUrl: './app/templates/configuration.html'
})

export class ConfigComponent {

    clientconfig:Object;
    salesconfig:Object

    constructor(private userservice:UserService, private router:Router) {

        this.clientconfig = userservice.getClientConfig();
        this.salesconfig = userservice.getSalesConfig();
    }

    clientConfigEdit() {
        this.router.navigateByUrl('/clientconfig');

    }

    salesConfigEdit() {
        this.router.navigateByUrl('/salesconfig');
    }
}
