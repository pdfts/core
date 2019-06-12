import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';

export interface IPDFObjectArray {
  [position: number]: PdfObject;
  length: number;
  push(item: PdfObject): number;
}
