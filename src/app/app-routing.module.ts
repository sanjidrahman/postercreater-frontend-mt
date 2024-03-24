import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { EditorComponent } from './components/editor/editor.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { appGuardGuard } from './guards/app-guard.guard';

const routes: Routes = [
  {
    path: '', title: 'Nav', component: NavigationComponent,
    children:
      [
        { path: '', title: 'Home', component: HomeComponent },
        { path: 'home', redirectTo: '', pathMatch: 'full' }
      ]
  },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'editor', title: 'Editor', component: EditorComponent, canActivate: [appGuardGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
