import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';

export class Palette extends PdfObject {
  public Stream: string;

  constructor(public Id: number, public Generation: number) {
    super();

    this.Type = PdfObjectType.Sig;
  }

  endObject() {
    // ToDo: just added the file and a demo sig field...
    // /Desc removed
    return [
      `/Length ${this.Stream.length}`,
      '>>',
      'stream',
      this.Stream,
      `endstream`,
      'endobj'
    ];
  }

  compile(): string[] {
    return [...this.startObject(), ...this.endObject()];
  }
}
