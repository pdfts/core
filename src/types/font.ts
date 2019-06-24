import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';
import { FontDescriptor } from './fontdescriptor';
import { FontFile } from './fontfile';

/**
 *
 *
 * @export
 * @class Font
 * @extends {PdfObject}
 */
export class Font extends PdfObject {
  public BaseFont: string;

  constructor(
    public Id: number,
    public Generation: number,
    private _fontFile?: FontFile,
    private _fontDescriptor?: FontDescriptor,
    private _fontWidths?: any[],
    private _subType: string = 'TrueType',
    private _baseFont: string = 'Helvetica'
  ) {
    super();

    this.Type = PdfObjectType.Font;
    this.BaseFont = this._fontDescriptor
      ? this._fontDescriptor.FontName
      : _baseFont;
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
      `/Subtype /${this._subType}`,
      `/Encoding /WinAnsiEncoding`,
      `/BaseFont /${this.BaseFont}`,
      this._fontFile ? `/FirstChar ${this._fontFile.FirstChar}` : '',
      this._fontFile ? `/LastChar ${this._fontFile.LastChar}` : '',
      this._fontDescriptor
        ? `/FontDescriptor ${this._fontDescriptor.Id} ${
            this._fontDescriptor.Generation
          } R`
        : '',
      this._fontWidths ? `/Widths [${this._fontWidths.join(' ')}]` : ''
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
