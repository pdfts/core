import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';

export class Sig extends PdfObject {
  constructor(public Id: number, public Generation: number) {
    super();

    this.Type = PdfObjectType.Sig;
  }

  compileUnprocessed() {
    // ToDo: uhm... ya... you know
    // /Desc removed
    return [
      '/Type /Sig',
      '/Filter Adobe.PPKLite',
      '/Subfilter adbe.pkcs7.detached',
      '/ByteRange [ 0 ********** ********** ********** ]',
      '/Contents 8192',
      '/Reason ?',
      '/M ?'
    ];
  }

  compile(): string[] {
    return [
      ...this.startObject(),
      ...this.compileUnprocessed(),
      ...this.endObject()
    ];
  }
}
