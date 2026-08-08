import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IngresarCodigoComponent } from './components/ingresar-codigo/ingresar-codigo.component';
import { ControlCartonComponent } from './components/control-carton/control-carton.component';

export const routes: Routes = [
    { path: '', component: IngresarCodigoComponent },
    { path: 'ingresar-codigo', component: IngresarCodigoComponent},
    { path: 'control-carton', component: ControlCartonComponent},
    { path: '**', component: IngresarCodigoComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutesModule { }
