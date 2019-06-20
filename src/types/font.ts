import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';
import { FontDescriptor } from './fontdescriptor';
import { FontWidths } from './fontwidths';
import { FontFile } from './fontfile';

/**
 *
 *
 * @export
 * @class Font
 * @extends {PdfObject}
 */
export class Font extends PdfObject {
  constructor(
    public Id: number,
    public Generation: number,
    private _fontFile: FontFile,
    private _fontDescriptor: FontDescriptor,
    private _fontWidths: FontWidths
  ) {
    super();

    this.Type = PdfObjectType.Font;
  }

  /**
   *
   *
   * @returns
   * @memberof Font
   */
  compileUnprocessed() {
    return [
      `/Type /Font`,
      `/Subtype /TrueType`,
      `/Encoding /WinAnsiEncoding`,
      `/BaseFont /${this._fontDescriptor.FontName}`,
      `/FirstChar ${this._fontFile.FirstChar}`,
      `/LastChar ${this._fontFile.LastChar}`,
      `/FontDescriptor ${this._fontDescriptor.Id} ${
        this._fontDescriptor.Generation
      } R`,
      `/Widths ${this._fontWidths.Id} ${this._fontWidths.Generation} R`
    ];
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof Font
   */
  compile(): string[] {
    return [
      ...this.startObject(),
      ...this.compileUnprocessed(),
      ...this.endObject()
    ];
  }
}
