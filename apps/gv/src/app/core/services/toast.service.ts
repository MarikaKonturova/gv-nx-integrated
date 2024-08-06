import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export const TOAST_TYPES = {
  error: 'error',
  success: 'success',
} as const;
type ObjectValues<T> = T[keyof T];
type ToastTypes = ObjectValues<typeof TOAST_TYPES>;

export interface ToastData {
  content: string;
  progressWidth?: string;
  show?: boolean;
  title: string;
  type?: ToastTypes;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  data!: ToastData;
  public open = new Subject<ToastData>();

  hide() {
    this.data = { ...this.data, show: false };
    this.open.next(this.data);
  }

  initiate(data: ToastData) {
    if (data.type) {
      this.data.type = TOAST_TYPES.error;
    }
    this.data = { ...data, progressWidth: '100%', show: true };
    this.open.next(this.data);
  }
}
