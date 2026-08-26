import { Component, computed, inject } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { DOC_TYPE_LABELS } from '../../../data-access/datacap/models/batch.model';
import { BatchStoreService } from '../../../state/batch-store.service';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [MatListModule, MatChipsModule, MatIconModule],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.scss',
})
export class DocumentListComponent {
  private readonly store = inject(BatchStoreService);

  readonly documents = this.store.documents;
  readonly selectedDocIndex = this.store.selectedDocIndex;
  readonly selectedPageIndex = this.store.selectedPageIndex;

  readonly docTypeLabel = (docType: string) => DOC_TYPE_LABELS[docType] ?? docType;

  readonly docStatus = computed(() => (docIndex: number) => {
    const doc = this.documents()[docIndex];
    if (!doc) return 'empty';
    if (doc.fields.length === 0) return 'no-fields';
    if (doc.fields.every((f) => f.reviewed)) return 'reviewed';
    if (doc.fields.some((f) => f.status === 'flagged')) return 'flagged';
    if (doc.fields.some((f) => f.status === 'low-confidence')) return 'low-confidence';
    return 'ok';
  });

  selectDocument(index: number): void {
    this.store.selectDocument(index);
  }

  selectPage(docIndex: number, pageIndex: number): void {
    this.store.selectDocument(docIndex);
    this.store.selectPage(pageIndex);
  }
}
