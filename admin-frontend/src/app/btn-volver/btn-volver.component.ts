import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-btn-volver',
  standalone: true,
  imports: [],
  templateUrl: './btn-volver.component.html',
  styleUrl: './btn-volver.component.css'
})
export class BtnVolverComponent {
  constructor(
    private _location: Location
  ) { }

  cancelar() {
    this._location.back();
  }
}
