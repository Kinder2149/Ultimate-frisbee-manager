import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminShellComponent } from './components/admin-shell/admin-shell.component';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    AdminShellComponent
  ]
})
export class AdminModule {}
