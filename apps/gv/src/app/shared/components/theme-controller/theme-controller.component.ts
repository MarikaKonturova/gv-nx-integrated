import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';

import { ThemeService } from '../../../core/services/theme.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TitleCasePipe],
  selector: 'app-theme-controller',
  standalone: true,
  template: `
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn  btn-ghost m-1">
        Theme
        <!-- <svg-icon src="assets/icons/arrowDown.svg"></svg-icon> -->
      </div>
      <ul tabindex="0" class="dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
        @for(theme of themes; track theme){
        <li>
          <input
            type="radio"
            name="theme-dropdown"
            class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
            (click)="themeService.applyTheme(theme); selectedTheme = theme"
            [attr.aria-label]="theme | titlecase"
            [value]="theme"
            [checked]="selectedTheme === theme" />
        </li>
        }
      </ul>
    </div>
  `,
})
export class ThemeControllerComponent implements OnInit {
  selectedTheme!: string;
  themes = ['coffee', 'retro', 'autumn', 'forest'];
  themeService = inject(ThemeService);
  ngOnInit() {
    this.selectedTheme = this.themeService.getInitialTheme();
  }
}
