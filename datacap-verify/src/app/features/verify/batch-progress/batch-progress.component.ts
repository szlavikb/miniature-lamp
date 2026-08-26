import { Component, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BatchStoreService } from '../../../state/batch-store.service';

@Component({
  selector: 'app-batch-progress',
  standalone: true,
  imports: [MatProgressBarModule],
  templateUrl: './batch-progress.component.html',
  styleUrl: './batch-progress.component.scss',
})
export class BatchProgressComponent {
  private readonly store = inject(BatchStoreService);

  readonly progress = this.store.progress;

  readonly percent = () => {
    const { done, total } = this.progress();
    return total === 0 ? 0 : Math.round((done / total) * 100);
  };
}
