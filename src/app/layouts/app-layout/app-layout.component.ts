import { Component } from '@angular/core';
import { HeaderComponent } from '../../features/header/header.component';
import { SidebarComponent } from '../../features/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { BottomBarComponent } from '../../features/bottom-bar/bottom-bar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
  imports: [HeaderComponent, SidebarComponent, RouterOutlet, BottomBarComponent]
})
export class AppLayoutComponent {}
