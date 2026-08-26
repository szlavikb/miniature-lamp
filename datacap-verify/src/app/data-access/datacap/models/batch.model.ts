export type FieldStatus = 'ok' | 'flagged' | 'low-confidence';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AiRecognition {
  fieldEntropy: number;
  fieldConfidence: number;
  aiValue: string;
}

export interface DatacapField {
  fieldId: string;
  label: string;
  value: string;
  type: string;
  // TODO: a valós batch mintában a Position/cr koordináták mindig 0,0,0,0 -
  // amint a Datacap valós bounding box-okat ad, ez itt kitölthető és a
  // képen kiemelhető a mező régiója.
  position: BoundingBox;
  status: FieldStatus;
  rawStatus: '0' | '1';
  requiredConfidence: number;
  message?: string;
  errorCode?: string;
  sapOrigValue?: string;
  confidenceLevel?: string;
  comment?: string;
  aiRecognition?: AiRecognition;
  reviewed: boolean;
  edited: boolean;
}

export interface Page {
  id: string;
  imageFile: string;
  parentImage?: string;
  status: string;
  comments?: string;
  dataFile?: string;
}

export interface DatacapDocument {
  id: string;
  docType: string;
  pages: Page[];
  fields: DatacapField[];
}

export interface Batch {
  id: string;
  documents: DatacapDocument[];
}

export const DOC_TYPE_LABELS: Record<string, string> = {
  Szemelyi_igazolvany: 'Személyi igazolvány',
  Igenylolap: 'Igénylőlap',
  Lakcimkartya: 'Lakcímkártya',
  QR_kodos_tajekoztato: 'QR-kódos tájékoztató',
  AltalanosTajekoztato: 'Általános tájékoztató',
  OtherDocument: 'Egyéb dokumentum',
};

// A mezőnevek a valós Datacap batch (DMAICreditCardClaim) tm000015.xml /
// tm000030.xml mintáiból származnak - lásd src/assets/mock-data.
export const DOC_TYPE_FIELD_LABELS: Record<string, Record<string, string>> = {
  Szemelyi_igazolvany: {
    idCardSurname: 'Vezetéknév',
    idCardGivenName1: 'Keresztnév',
    idCardBirthdate: 'Születési dátum',
    idCardBirthPlace: 'Születési hely',
    idCardCountryCitizen: 'Állampolgárság',
    idCardMotherMaidenName: 'Anyja neve',
    idCardPrefix: 'Előtag',
  },
  QR_kodos_tajekoztato: {
    qrDocSurname: 'Családi név',
    qrDocPlaceOfSigning: 'Keltezés helye',
    qrDocDateOfSigning: 'Keltezés dátuma',
    qrDocVerzioPage1: 'Dokumentum verziószám (1. oldal)',
    qrDocPrefix: 'Előtag',
  },
};
