import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { DatacapXmlParserService } from './datacap-xml-parser.service';
import { Batch, DatacapDocument } from './models/batch.model';

// Angular 18-ban a `public/` mappa gyökérként szolgál ki (nem `assets/`),
// ezért a minta fájlok itt vannak: public/mock-data/.
const MOCK_DATA_BASE = 'mock-data';

/**
 * Ez a service felel a batch adatok betöltéséért. Most az assets alatti
 * minta XML-eket olvassa, de ez a pont a jövőbeli csere helye: amikor
 * valós Datacap fájl-/hálózati/API integráció készül, csak ez a service
 * változik - a parser és a modell változatlan marad.
 */
@Injectable({ providedIn: 'root' })
export class DatacapMockSourceService {
  private readonly http = inject(HttpClient);
  private readonly parser = inject(DatacapXmlParserService);

  loadBatch() {
    return this.http.get(`${MOCK_DATA_BASE}/verify.xml`, { responseType: 'text' }).pipe(
      map((xml) => this.parser.parseBatchIndex(xml)),
      switchMap(({ batchId, documents }) => {
        const documentsWithFields$ = documents.map((docSummary) => this.attachFields(docSummary));
        return forkJoin(documentsWithFields$).pipe(map((docs) => this.parser.assembleBatch(batchId, docs)));
      }),
    );
  }

  resolveImageUrl(imageFile: string): string {
    return `${MOCK_DATA_BASE}/images/${imageFile}`;
  }

  private attachFields(docSummary: Omit<DatacapDocument, 'fields'>) {
    const dataFile = docSummary.pages.find((page) => page.dataFile)?.dataFile;
    if (!dataFile) {
      return of<DatacapDocument>({ ...docSummary, fields: [] });
    }

    return this.http
      .get(`${MOCK_DATA_BASE}/${dataFile}`, { responseType: 'text' })
      .pipe(map((xml) => ({ ...docSummary, fields: this.parser.parseDocumentFields(xml) }) satisfies DatacapDocument));
  }
}

export type { Batch };
