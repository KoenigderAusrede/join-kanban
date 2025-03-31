import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingService } from './core/services/loading.service';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { CommonModule } from '@angular/common';
import { BottomBarComponent } from './features/bottom-bar/bottom-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, LoaderComponent, CommonModule],
})
export class AppComponent {
  isLoading$ = this.loadingService.getLoading();
  constructor(private loadingService: LoadingService) {}
}
