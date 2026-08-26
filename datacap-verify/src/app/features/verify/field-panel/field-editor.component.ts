import { DecimalPipe } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatacapField } from '../../../data-access/datacap/models/batch.model';
import { BatchStoreService } from '../../../state/batch-store.service';

@Component({
  selector: 'app-field-editor',
  standalone: true,
  imports: [DecimalPipe, FormsModule, MatFormFieldModule, MatInputModule, MatChipsModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './field-editor.component.html',
  styleUrl: './field-editor.component.scss',
})
export class FieldEditorComponent {
  private readonly store = inject(BatchStoreService);

  @Input({ required: true }) field!: DatacapField;

  readonly statusLabel: Record<DatacapField['status'], string> = {
    ok: 'Rendben',
    flagged: 'Hibás',
    'low-confidence': 'Alacsony bizonyosság',
  };

  onValueChange(value: string): void {
    this.store.updateFieldValue(this.field.fieldId, value);
  }

  markReviewed(): void {
    this.store.markFieldReviewed(this.field.fieldId);
  }
}
