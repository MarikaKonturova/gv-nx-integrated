import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  imports: [CommonModule],
  selector: 'lib-shared-lib',
  standalone: true,
  styleUrl: './shared-lib.component.scss',
  templateUrl: './shared-lib.component.html',
})
export class SharedLibComponent {}
