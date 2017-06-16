/**
 * Created by aasheesh on 27/12/16.
 */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule, HTTP_PROVIDERS }    from '@angular/http';
import { PopoverModule } from "ngx-popover";
import {DataTableModule} from "angular2-datatable";
import { Ng2SearchPipeModule } from 'ng2-search-filter';


import { AppComponent } from './component/app.component';
import { LoginComponent } from './component/login.component';
import { HeaderComponent } from './component/header.component';
import { SideMenuComponent } from './component/sidemenu.component';
import { ClientConfigComponent } from './component/clientconfig.component';
import { ConfigComponent } from './component/configuration.component';
import { ObjectMappingComponent } from './component/objectmapping.component';
import { SalesConfigComponent } from './component/salesconfig.component';
import { ViewMappingComponent } from './component/viewmapping.component';
import { DataFilterPipe } from './pipes/datafilter.pipe';
import { CloudComponent } from './component/cloudsharing.component';
import { GoogleDriveComponent } from './component/googledriveapi.component';
import { AttributeMappingComponent } from './component/attributemapping.component';
import { SummaryComponent } from './component/summary.component';
import { ImportComponent } from './component/import.component';
import { ExportComponent } from './component/export.component';
import { Export2Component } from './component/export2.component';
import { ExportSummary } from './component/exportsummary.component';
import { TasklistComponent } from './component/tasklist.component';


import { MenuDirective } from './directives/menu.directive';

import { DataService } from './services/data.service';
import { UserService } from './services/user.service';
import { CloudService } from './services/cloudsharing.service';
import { AuthGuard } from './services/auth.service';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppRoutes } from './routes';

@NgModule({
    imports: [BrowserModule, Ng2SearchPipeModule, ReactiveFormsModule, RouterModule.forRoot(AppRoutes), HttpModule, FormsModule, DataTableModule, PopoverModule ],
    declarations: [AppComponent, LoginComponent, HeaderComponent, SideMenuComponent, ClientConfigComponent, ConfigComponent, ObjectMappingComponent, SalesConfigComponent, ViewMappingComponent, DataFilterPipe, CloudComponent, GoogleDriveComponent, MenuDirective, AttributeMappingComponent, SummaryComponent, ImportComponent, ExportComponent, Export2Component, ExportSummary, TasklistComponent],
    bootstrap: [AppComponent],
    providers: [DataService, UserService, CloudService, AuthGuard ]
})
class Main {
}


platformBrowserDynamic().bootstrapModule(Main)