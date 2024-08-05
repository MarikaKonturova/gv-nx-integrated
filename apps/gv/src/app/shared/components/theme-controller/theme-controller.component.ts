import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-theme-controller',
  standalone: true,
  template: `
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn  btn-ghost m-1">
        Theme
        <!-- <svg-icon src="assets/icons/arrowDown.svg"></svg-icon> -->
      </div>
      <ul
        tabindex="0"
        class="dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
      >
        <li>
          <input
            type="radio"
            name="theme-dropdown"
            class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
            aria-label="Coffee"
            value="coffee"
          />
        </li>
        <li>
          <input
            type="radio"
            name="theme-dropdown"
            class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
            aria-label="Retro"
            value="retro"
          />
        </li>
        <li>
          <input
            type="radio"
            name="theme-dropdown"
            class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
            aria-label="Autumn"
            value="autumn"
          />
        </li>
        <li>
          <input
            type="radio"
            name="theme-dropdown"
            class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
            aria-label="Forest"
            value="forest"
          />
        </li>
      </ul>
    </div>
  `,
})
export class ThemeControllerComponent {}
