import { Injectable } from '@angular/core';
import { decodeCharCodes } from './char-code-decoder';
import { AiRecognition, Batch, BoundingBox, DatacapDocument, DatacapField, FieldStatus, Page } from './models/batch.model';

const SUB_FIELD_SUFFIXES = ['_confidenceLevel', '_errorMessage', '_comment', '_AIRecognition'];

function readValue(fieldEl: Element, name: string): string | undefined {
  const node = Array.from(fieldEl.children).find((el) => el.tagName === 'V' && el.getAttribute('n') === name);
  return node?.textContent?.trim() || undefined;
}

// A Datacap tizedes értékei (fieldEntropy, fieldConfidence) magyar
// tizedesvesszővel jönnek (pl. "8,98635930049524"), nem ponttal.
function readNumber(fieldEl: Element, name: string): number {
  const raw = readValue(fieldEl, name) ?? '0';
  return Number(raw.replace(',', '.')) || 0;
}

function parsePosition(raw: string | undefined): BoundingBox {
  const [x, y, width, height] = (raw ?? '0,0,0,0').split(',').map((n) => Number(n) || 0);
  return { x, y, width, height };
}

/**
 * A parsolás/dekódolás itt teljesen elkülönül a betöltéstől (lásd
 * DatacapMockSourceService): ez a service csak nyers XML szöveget kap,
 * és a fenti modellt adja vissza. Amikor később valós fájl- vagy
 * Datacap-forrásból jön az XML, ez a service változatlanul újrahasználható.
 */
@Injectable({ providedIn: 'root' })
export class DatacapXmlParserService {
  parseBatchIndex(xml: string): { batchId: string; documents: Omit<DatacapDocument, 'fields'>[] } {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const batchEl = doc.querySelector('B');
    const batchId = batchEl?.getAttribute('id') ?? '';

    const documents = Array.from(doc.querySelectorAll('B > D')).map((docEl): Omit<DatacapDocument, 'fields'> => {
      const pages: Page[] = Array.from(docEl.querySelectorAll('P')).map((pageEl) => ({
        id: pageEl.getAttribute('id') ?? '',
        imageFile: pageEl.getAttribute('IMAGEFILE') ?? '',
        parentImage: pageEl.getAttribute('ParentImage') ?? undefined,
        status: pageEl.getAttribute('STATUS') ?? '0',
        comments: pageEl.getAttribute('COMMENTS') ?? undefined,
        dataFile: pageEl.getAttribute('DATAFILE') ?? undefined,
      }));

      return {
        id: docEl.getAttribute('id') ?? '',
        docType: docEl.getAttribute('TYPE') ?? 'OtherDocument',
        pages,
      };
    });

    return { batchId, documents };
  }

  parseDocumentFields(xml: string): DatacapField[] {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');

    // A valós Datacap XML-ben az al-mezők (_confidenceLevel, _errorMessage,
    // _comment, _AIRecognition) a SZÜLŐ <F> elemen BELÜL, beágyazva
    // szerepelnek - nem a <P> közvetlen gyerekeiként. Ezért a bázis mezők
    // egyszerűen a <P> közvetlen <F> gyerekei; az al-mezőket a mező saját
    // querySelector-ával (leszármazottak között) keressük meg.
    const baseFieldEls = Array.from(doc.querySelectorAll('P > F')).filter((el) => {
      const id = el.getAttribute('id') ?? '';
      return !SUB_FIELD_SUFFIXES.some((suffix) => id.endsWith(suffix));
    });

    return baseFieldEls.map((fieldEl) => {
      const fieldId = fieldEl.getAttribute('id') ?? '';
      const findSubField = (suffix: string) => fieldEl.querySelector(`F[id="${fieldId}${suffix}"]`);

      const value = decodeCharCodes(fieldEl);
      const rawStatus = (readValue(fieldEl, 'STATUS') ?? '0') as '0' | '1';
      const requiredConfidence = readNumber(fieldEl, 'ReqConf');

      const aiRecognitionEl = findSubField('_AIRecognition');
      const aiRecognition: AiRecognition | undefined = aiRecognitionEl
        ? {
            fieldEntropy: readNumber(aiRecognitionEl, 'fieldEntropy'),
            fieldConfidence: readNumber(aiRecognitionEl, 'fieldConfidence'),
            aiValue: decodeCharCodes(aiRecognitionEl),
          }
        : undefined;

      const status: FieldStatus =
        rawStatus === '1' ? 'flagged' : aiRecognition && aiRecognition.fieldConfidence < requiredConfidence ? 'low-confidence' : 'ok';

      const field: DatacapField = {
        fieldId,
        label: fieldId,
        value,
        type: readValue(fieldEl, 'TYPE') ?? fieldId,
        position: parsePosition(readValue(fieldEl, 'Position')),
        status,
        rawStatus,
        requiredConfidence,
        message: readValue(fieldEl, 'MESSAGE'),
        errorCode: readValue(fieldEl, 'VALIDATION_ERROR_CODES'),
        sapOrigValue: readValue(fieldEl, 'SAP_ORIG_VALUE'),
        confidenceLevel: decodeCharCodes(findSubField('_confidenceLevel')) || undefined,
        // A _comment/_errorMessage al-mezők a valós mintában is <V> gyerekeket
        // tartalmaznak (TYPE/Position/STATUS) - a tényleges szöveg (ha van)
        // karakterkód-sorozatként jelenne meg bennük, ezért ugyanazzal a
        // dekódolóval olvassuk, NEM a teljes textContent-tel (az a beágyazott
        // V-k szövegét is belekeverné).
        comment: decodeCharCodes(findSubField('_comment')) || undefined,
        aiRecognition,
        reviewed: false,
        edited: false,
      };

      return field;
    });
  }

  assembleBatch(batchId: string, documents: (Omit<DatacapDocument, 'fields'> & { fields: DatacapField[] })[]): Batch {
    return { id: batchId, documents };
  }
}
