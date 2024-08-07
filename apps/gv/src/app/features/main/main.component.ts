import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '@gv/shared/components/navbar/navbar.component';
import { ThemeControllerComponent } from '@gv/shared/components/theme-controller/theme-controller.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavbarComponent, ThemeControllerComponent, RouterOutlet],
  standalone: true,
  template: `
    <app-navbar />
    <router-outlet />
  `,
})
export class MainComponent {}
