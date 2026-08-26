import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DOC_TYPE_FIELD_LABELS } from '../../../data-access/datacap/models/batch.model';
import { BatchStoreService } from '../../../state/batch-store.service';
import { FieldEditorComponent } from './field-editor.component';

@Component({
  selector: 'app-field-panel',
  standalone: true,
  imports: [FieldEditorComponent, MatButtonModule, MatIconModule],
  templateUrl: './field-panel.component.html',
  styleUrl: './field-panel.component.scss',
})
export class FieldPanelComponent {
  private readonly store = inject(BatchStoreService);

  readonly currentDocument = this.store.currentDocument;
  readonly currentFields = this.store.currentFields;

  readonly labeledFields = computed(() => {
    const docType = this.currentDocument()?.docType ?? '';
    const labels = DOC_TYPE_FIELD_LABELS[docType] ?? {};
    return this.currentFields().map((field) => ({ ...field, label: labels[field.fieldId] ?? field.fieldId }));
  });

  markDocumentReviewed(): void {
    this.store.markDocumentReviewed();
  }
}
