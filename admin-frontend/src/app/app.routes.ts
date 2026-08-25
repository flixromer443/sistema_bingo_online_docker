import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TablaComponent } from './tabla/tabla.component';
import { HomeComponent } from './home/home.component';
import { DetalleComponent } from './detalle/detalle.component';
import { ModificarComponent } from './modificar/modificar.component';
import { CrearComponent } from './crear/crear.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'tabla', component: TablaComponent },
    { path: 'detalle/:id', component: DetalleComponent },
    { path: 'modificar/:id', component: ModificarComponent },
    { path: 'crear', component: CrearComponent },
    { path: '**', component: HomeComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutesModule { }
