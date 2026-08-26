import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatacapMockSourceService } from '../../../data-access/datacap/datacap-mock-source.service';
import { DOC_TYPE_LABELS } from '../../../data-access/datacap/models/batch.model';
import { BatchStoreService } from '../../../state/batch-store.service';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatChipsModule, MatTooltipModule],
  templateUrl: './document-viewer.component.html',
  styleUrl: './document-viewer.component.scss',
})
export class DocumentViewerComponent {
  private readonly store = inject(BatchStoreService);
  private readonly source = inject(DatacapMockSourceService);

  readonly currentDocument = this.store.currentDocument;
  readonly currentPage = this.store.currentPage;
  readonly selectedDocIndex = this.store.selectedDocIndex;
  readonly selectedPageIndex = this.store.selectedPageIndex;
  readonly documents = this.store.documents;

  readonly docTypeLabel = (docType: string) => DOC_TYPE_LABELS[docType] ?? docType;

  imageUrl(imageFile: string | undefined): string {
    return imageFile ? this.source.resolveImageUrl(imageFile) : '';
  }

  previousDocument(): void {
    this.store.previousDocument();
  }

  nextDocument(): void {
    this.store.nextDocument();
  }

  previousPage(): void {
    this.store.previousPage();
  }

  nextPage(): void {
    this.store.nextPage();
  }
}
