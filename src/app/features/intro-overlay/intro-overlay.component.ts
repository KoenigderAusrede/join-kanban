import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-intro-overlay',
  standalone: true,
  templateUrl: './intro-overlay.component.html',
  styleUrls: ['./intro-overlay.component.scss']
})
export class IntroOverlayComponent {
  @Output() animationDone = new EventEmitter<void>();

  ngOnInit(): void {
    setTimeout(() => {
      this.animationDone.emit();
    }, 1600); // 0.8s delay + 0.8s animation
  }
}
