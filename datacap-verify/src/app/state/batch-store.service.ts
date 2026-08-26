import { Injectable, computed, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatacapMockSourceService } from '../data-access/datacap/datacap-mock-source.service';
import { Batch, DatacapField } from '../data-access/datacap/models/batch.model';

@Injectable({ providedIn: 'root' })
export class BatchStoreService {
  private readonly source = inject(DatacapMockSourceService);
  private readonly snackBar = inject(MatSnackBar);

  readonly batch = signal<Batch | null>(null);
  readonly loading = signal(false);
  readonly selectedDocIndex = signal(0);
  readonly selectedPageIndex = signal(0);

  readonly documents = computed(() => this.batch()?.documents ?? []);
  readonly currentDocument = computed(() => this.documents()[this.selectedDocIndex()]);
  readonly currentPage = computed(() => this.currentDocument()?.pages[this.selectedPageIndex()]);
  readonly currentFields = computed(() => this.currentDocument()?.fields ?? []);

  readonly progress = computed(() => {
    const docs = this.documents();
    const done = docs.filter((doc) => doc.fields.length === 0 || doc.fields.every((f) => f.reviewed)).length;
    return { done, total: docs.length };
  });

  loadBatch(): void {
    this.loading.set(true);
    this.source.loadBatch().subscribe({
      next: (batch) => {
        this.batch.set(batch);
        this.selectedDocIndex.set(0);
        this.selectedPageIndex.set(0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Nem sikerült betölteni a batch adatait.', 'OK', { duration: 5000 });
      },
    });
  }

  selectDocument(index: number): void {
    this.selectedDocIndex.set(index);
    this.selectedPageIndex.set(0);
  }

  selectPage(index: number): void {
    this.selectedPageIndex.set(index);
  }

  nextDocument(): void {
    const next = this.selectedDocIndex() + 1;
    if (next < this.documents().length) {
      this.selectDocument(next);
    }
  }

  previousDocument(): void {
    const prev = this.selectedDocIndex() - 1;
    if (prev >= 0) {
      this.selectDocument(prev);
    }
  }

  nextPage(): void {
    const next = this.selectedPageIndex() + 1;
    if (next < (this.currentDocument()?.pages.length ?? 0)) {
      this.selectPage(next);
    }
  }

  previousPage(): void {
    const prev = this.selectedPageIndex() - 1;
    if (prev >= 0) {
      this.selectPage(prev);
    }
  }

  updateFieldValue(fieldId: string, newValue: string): void {
    this.updateField(fieldId, (field) => ({ ...field, value: newValue, edited: true }));
  }

  markFieldReviewed(fieldId: string): void {
    this.updateField(fieldId, (field) => ({ ...field, reviewed: true }));
  }

  // Jelenleg csak a helyi state-et módosítja. Ez a pont a jövőbeli
  // mentés/submit API-hívás csatlakozási helye (Datacap felé).
  markDocumentReviewed(): void {
    const docIndex = this.selectedDocIndex();
    this.batch.update((batch) => {
      if (!batch) return batch;
      const documents = batch.documents.map((doc, i) =>
        i === docIndex ? { ...doc, fields: doc.fields.map((f) => ({ ...f, reviewed: true })) } : doc,
      );
      return { ...batch, documents };
    });
    this.snackBar.open('Dokumentum ellenőrizve.', undefined, { duration: 2500 });
  }

  private updateField(fieldId: string, updater: (field: DatacapField) => DatacapField): void {
    const docIndex = this.selectedDocIndex();
    this.batch.update((batch) => {
      if (!batch) return batch;
      const documents = batch.documents.map((doc, i) => {
        if (i !== docIndex) return doc;
        return { ...doc, fields: doc.fields.map((f) => (f.fieldId === fieldId ? updater(f) : f)) };
      });
      return { ...batch, documents };
    });
  }
}
