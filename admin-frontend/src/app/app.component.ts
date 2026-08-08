import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TablaComponent } from './tabla/tabla.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TablaComponent, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'SISTEMA_BINGO_ONLINE';
}
