import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';

export class Sig extends PdfObject {
  constructor(public Id: number, public Generation: number) {
    super();

    this.Type = PdfObjectType.Sig;
  }

  compileUnprocessed() {
    // ToDo: just added the file and a demo sig field...
    // /Desc removed
    return [
      '/Type /Sig',
      '/Filter /Adobe.PPKLite',
      '/Subfilter /adbe.pkcs7.detached',
      '/ByteRange [0 /********** /********** /**********]',
      `/Contents <${new Array(8193).join('0')}>`,
      '/Reason (just because)',
      '/M (D:20190611075000Z)'
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
