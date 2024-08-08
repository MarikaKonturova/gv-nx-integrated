import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { TOAST_TYPES, ToastData } from '../models/toast.interface';

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
