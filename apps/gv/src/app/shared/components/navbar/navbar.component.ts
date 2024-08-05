import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ThemeControllerComponent } from '../theme-controller/theme-controller.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ThemeControllerComponent],
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {}
