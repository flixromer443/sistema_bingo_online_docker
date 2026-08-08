import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TablaComponent } from '../tabla/tabla.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TablaComponent, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  title= 'API Postgres';
}
