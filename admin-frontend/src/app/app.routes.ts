import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CargaDatosJugadoresComponent } from './components/carga-datos-jugadores/carga-datos-jugadores.component';
import { HomeComponent } from './components/home/home.component';
import { CargaDatosSorteoComponent } from './components/carga-datos-sorteo/carga-datos-sorteo.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'carga-datos-jugadores', component: CargaDatosJugadoresComponent },
    { path: 'carga-datos-sorteo', component: CargaDatosSorteoComponent },
    { path: '**', component: HomeComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutesModule { }
