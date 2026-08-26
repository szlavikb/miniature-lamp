import { Component, OnInit, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BatchStoreService } from '../../state/batch-store.service';
import { BatchProgressComponent } from './batch-progress/batch-progress.component';
import { DocumentListComponent } from './document-list/document-list.component';
import { DocumentViewerComponent } from './document-viewer/document-viewer.component';
import { FieldPanelComponent } from './field-panel/field-panel.component';

@Component({
  selector: 'app-verify-page',
  standalone: true,
  imports: [MatToolbarModule, DocumentListComponent, DocumentViewerComponent, FieldPanelComponent, BatchProgressComponent],
  templateUrl: './verify-page.component.html',
  styleUrl: './verify-page.component.scss',
})
export class VerifyPageComponent implements OnInit {
  private readonly store = inject(BatchStoreService);

  readonly batch = this.store.batch;
  readonly loading = this.store.loading;

  ngOnInit(): void {
    this.store.loadBatch();
  }
}
