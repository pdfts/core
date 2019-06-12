import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';

export class FontFile extends PdfObject {
  constructor(
    public Id: number,
    public Generation: number,
    private _fontName: string,
    private _fontData: string
  ) {
    super();

    this.Type = PdfObjectType.FontFile;
  }

  endObject() {
    return [
      '>>',
      'stream',
      Buffer.from(this._fontData, 'base64').toString(),
      'endstream',
      'endobj'
    ];
  }

  compileUnprocessed() {
    // ToDo: uhm... ya... you know
    return ['/Length 83691 /Filter /FlateDecode /Length1 169124'];
  }

  compile(): string[] {
    return [
      ...this.startObject(),
      ...this.compileUnprocessed(),
      ...this.endObject()
    ];
  }
}
