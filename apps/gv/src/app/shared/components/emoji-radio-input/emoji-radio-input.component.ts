import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  Provider,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Data } from './data.interface';
import { IsDisplayEmojiOptionsPipe } from './is-display-emoji-options.pipe';

export const CUSTOM_CONROL_VALUE_ACCESSOR: Provider = {
  multi: true,
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => EmojiRadioInputComponent),
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, IsDisplayEmojiOptionsPipe],
  providers: [CUSTOM_CONROL_VALUE_ACCESSOR],
  selector: 'app-emoji-radio-input',
  standalone: true,
  templateUrl: './emoji-radio-input.component.html',
})
export class EmojiRadioInputComponent implements ControlValueAccessor {
  private onChange!: (value: string) => void;
  private onTouched!: () => void;
  @Input() data!: Data[];
  public value: string | undefined;

  public onValueChanges(event: Event): void {
    const targetDivElement = event.target as HTMLDivElement;
    const content = targetDivElement.getAttribute('data-value') as string;
    this.value = content;
    this.onChange(content);
  }

  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public writeValue(value: string): void {
    this.value = value;
  }
}
