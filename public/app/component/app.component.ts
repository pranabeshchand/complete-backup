/**
 * Created by aasheesh on 27/12/16.
 */
import { Component, AfterViewInit, OnInit } from '@angular/core';
import { HeaderComponent } from './header.component';
import { SideMenuComponent } from './sidemenu.component';
import { DataService } from '../services/data.service';
import { ActivatedRoute } from '@angular/router'

@Component({
    selector: 'my-app',
    templateUrl: './app/templates/home.html'


})
export class AppComponent implements OnInit {
    code:string

    constructor(private dataservice:DataService, private route: ActivatedRoute) {


    }

    ngOnInit() {
        this.route
            .queryParams
            .subscribe(params => {

                this.code = params['code'];
               //alert(this.code);
            });
    }

}