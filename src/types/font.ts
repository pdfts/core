import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';
import { FontDescriptor } from './fontdescriptor';
import { FontWidths } from './fontwidths';
import { FontEncoding } from './fontencoding';

export class Font extends PdfObject {
  constructor(
    public Id: number,
    public Generation: number,
    private _fontDescriptor: FontDescriptor,
    private _fontWidths: FontWidths,
    private _fontEncoding: FontEncoding
  ) {
    super();

    this.Type = PdfObjectType.Font;
  }

  compileUnprocessed() {
    // ToDo: uhm... ya... you know
    return [
      `/Type /Font`,
      `/Subtype /Type1`,
      `/BaseFont /Diverda_Sans_Com_Medium`,
      `/FirstChar 32`,
      `/LastChar 255`,
      `/Widths ${this._fontWidths.Id} ${this._fontWidths.Generation} R`,
      `/FontEncoding  ${this._fontEncoding.Id} ${
        this._fontEncoding.Generation
      } R`
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
