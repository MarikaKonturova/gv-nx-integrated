import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, Subject, takeUntil, takeWhile } from 'rxjs';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  animations: [
    trigger('openClose', [
      state(
        'closed',
        style({
          right: '-400px',
          visibility: 'hidden',
        })
      ),
      state(
        'open',
        style({
          right: '40px',
        })
      ),
      transition('open <=> closed', [animate('0.5s ease-in-out')]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.component.html',
})
export class ToastComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private destroy$!: Subject<void>;
  private destroyRef = inject(DestroyRef);

  @ViewChild('element') progressBar!: ElementRef;
  toastService = inject(ToastService);
  // RENDERER2
  countDown() {
    this.destroy$ = new Subject();
    const progressBar = this.progressBar.nativeElement;
    const toastServiceData = this.toastService.data;

    progressBar.style.width = toastServiceData.progressWidth;
    let width = parseInt(progressBar.style.width, 10);

    interval(150)
      .pipe(
        takeUntil(this.destroy$),
        takeWhile(() => {
          width = parseInt(progressBar.style.width, 10);

          return width > 0;
        })
      )
      .subscribe({
        complete: () => {
          this.toastService.hide();

          this.cdr.markForCheck();
        },
        next: () => {
          toastServiceData.progressWidth = String(width - 2);

          progressBar.style.width = toastServiceData.progressWidth + '%';

          this.cdr.markForCheck();
        },
      });
  }

  ngOnInit() {
    this.toastService.open.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        if (data.show) {
          this.countDown();
        }
      },
    });
  }

  stopCountDown() {
    this.destroy$.next();

    this.destroy$.complete();
  }
}
