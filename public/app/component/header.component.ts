/**
 * Created by aasheesh on 28/12/16.
 */
import {Component} from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { MenuDirective } from '../directives/menu.directive';


@Component({
    selector: 'header',
    templateUrl: './app/templates/header.html'

})

export class HeaderComponent {
    username:string

    constructor(private userservice:UserService, private router:Router) {
        this.username = this.userservice.UserDetails.name;
    }



    logout() {

    }

    openNav() {
        document.getElementById("mySidenav").style.width = "250px";
        document.getElementById("main").style.marginLeft = "250px";
    }

    closeNav() {
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("main").style.marginLeft = "0";
    }
    openRightMenu() {
        document.getElementById("rightMenu").style.display = "block";
        document.getElementById("rightMenu").style.display = "block";
    }
    closeRightMenu() {
        document.getElementById("rightMenu").style.display = "none";
        document.getElementById("rightMenu").style.display = "none";
    }
}
