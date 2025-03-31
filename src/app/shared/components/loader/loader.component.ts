import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div class="loading-backdrop">
      <div class="spinner"></div>
    </div>
  `,
  styleUrls: ['loader.component.scss']
})
export class LoaderComponent {}
