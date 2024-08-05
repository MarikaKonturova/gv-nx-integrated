import { Pipe, PipeTransform } from '@angular/core';

import { Data } from './data.interface';

@Pipe({
  name: 'isDisplayEmojiOptions',
  standalone: true,
})
export class IsDisplayEmojiOptionsPipe implements PipeTransform {
  transform(item: Data, value?: string): boolean {
    const isHasOptionsToChoose =
      !!item.options && item.options.some((option) => option.value === value);

    return isHasOptionsToChoose || value === item.value;
  }
}
