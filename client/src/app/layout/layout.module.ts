import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HeaderComponent } from './components/header/header.component';
import { SidebarItemComponent } from './components/sidebar-item/sidebar-item.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LayoutComponent } from './layout.component';
import { LayoutRoutingModule } from './layout.routing.module';


@NgModule({
  declarations: [
    SidebarComponent,
    HeaderComponent,
    LayoutComponent,
    SidebarItemComponent,
  ],
  imports: [CommonModule, LayoutRoutingModule, MatIconModule, MatToolbarModule, MatButtonModule],
})
export class LayoutModule {}
