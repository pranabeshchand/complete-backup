/**
 * Created by aasheesh on 29/12/16.
 */

import { ClientConfigComponent } from './component/clientconfig.component';
import { AppComponent } from './component/app.component';
import { LoginComponent } from './component/login.component';
import { ConfigComponent } from './component/configuration.component';
import { ObjectMappingComponent } from './component/objectmapping.component';
import { SalesConfigComponent } from './component/salesconfig.component';
import { ViewMappingComponent } from './component/viewmapping.component';
import { AuthGuard } from './services/auth.service';
import { UserService } from './services/user.service';
import { CloudComponent } from './component/cloudsharing.component';
import { AttributeMappingComponent } from './component/attributemapping.component';
import { SummaryComponent } from './component/summary.component';
import { ImportComponent } from './component/import.component';
import { ExportComponent } from './component/export.component';
import { Export2Component } from './component/export2.component';
import { ExportSummary } from './component/exportsummary.component';
import { TasklistComponent } from './component/tasklist.component';


export const AppRoutes = [
    {path: 'clientconfig', component: ClientConfigComponent },
    {path: 'salesconfig', component: SalesConfigComponent},
    {path: 'objectmapping', component: ObjectMappingComponent, canActivate: [AuthGuard]},
    {path: 'configuration', component: ConfigComponent, canActivate: [AuthGuard]},
    {path: 'login', component: LoginComponent},
    {path: 'viewmapping', component: ViewMappingComponent},
    {path: 'home', component: AppComponent},
    {path: 'cloudsharing', component: CloudComponent},
    {path: 'attributemapping', component: AttributeMappingComponent},
    {path: 'summary', component: SummaryComponent},
    {path: 'tasklist', component: TasklistComponent},
    {path: 'import', component: ImportComponent, canActivate: [AuthGuard]},
    {path: 'import/update', component: ImportComponent, canActivate: [AuthGuard]},
    {path: 'export', component: ExportComponent, canActivate: [AuthGuard]},
    {path: '**', component: ExportComponent, canActivate: [AuthGuard]}
];


