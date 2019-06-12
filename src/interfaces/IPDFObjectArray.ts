import { PdfObject } from '../base/pdfobject';

export interface IPDFObjectArray {
  [position: number]: PdfObject;
  length: number;
  push(item: PdfObject): number;
}
