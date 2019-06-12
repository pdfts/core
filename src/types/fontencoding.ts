import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';

export class FontEncoding extends PdfObject {
  constructor(public Id: number, public Generation: number) {
    super();

    this.Type = PdfObjectType.FontEncoding;
  }

  compileSomething(): string[] {
    return ['/Type /Encoding', '/Differences [1 /a109 /a110 /a111 /a112]'];
  }

  compile(): string[] {
    return [
      ...this.startObject(),
      ...this.compileSomething(),
      ...this.endObject()
    ];
  }
}
