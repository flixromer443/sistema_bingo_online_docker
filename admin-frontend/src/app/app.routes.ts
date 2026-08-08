import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TablaComponent } from './tabla/tabla.component';
import { HomeComponent } from './home/home.component';
import { DetalleComponent } from './detalle/detalle.component';
import { ModificarComponent } from './modificar/modificar.component';
import { CrearComponent } from './crear/crear.component';
import { IngresarCodigoComponent } from './components/ingresar-codigo/ingresar-codigo.component';
import { ControlCartonComponent } from './components/control-carton/control-carton.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'tabla', component: TablaComponent },
    { path: 'detalle/:id', component: DetalleComponent },
    { path: 'modificar/:id', component: ModificarComponent },
    { path: 'crear', component: CrearComponent },
    { path: 'ingresar-codigo', component: IngresarCodigoComponent},
    { path: 'control-carton', component: ControlCartonComponent},
    { path: '**', component: HomeComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutesModule { }
