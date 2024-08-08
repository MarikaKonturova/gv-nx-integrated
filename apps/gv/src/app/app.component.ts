import { Component, DestroyRef, inject, OnInit, Renderer2 } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { ThemeService } from '@app/core/services/theme.service';
import { ToastComponent } from '@app/shared/components/toast/toast.component';
import { pairwise } from 'rxjs';

@Component({
  imports: [RouterModule, ToastComponent],
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private renderer = inject(Renderer2);
  private themeService = inject(ThemeService);
  title = 'gv';

  ngOnInit(): void {
    const initialTheme = this.themeService.getInitialTheme();

    this.themeService.applyTheme(initialTheme);

    this.renderer.addClass(document.body, initialTheme);

    this.themeService.theme$
      .pipe(pairwise(), takeUntilDestroyed(this.destroyRef))
      .subscribe(([prevTheme, newTheme]) => {
        this.renderer.removeClass(document.body, prevTheme);

        this.renderer.addClass(document.body, newTheme);
      });
  }
}
