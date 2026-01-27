import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-auth-loader',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './auth-loader.component.html',
  styleUrls: ['./auth-loader.component.scss']
})
export class AuthLoaderComponent {
  @Input() message: string = 'Chargement...';
  @Input() size: number = 40;
}
