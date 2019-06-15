import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';

/**
 * An object containing an array of widths for each character in a font
 *
 * @export
 * @class FontWidths
 * @extends {PdfObject}
 */
export class FontWidths extends PdfObject {
  constructor(
    public Id: number,
    public Generation: number,
    public Widths: number[]
  ) {
    super();

    this.Type = PdfObjectType.FontWidths;
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof FontWidths
   */
  startObject(): string[] {
    return [`${this.Id} ${this.Generation} obj`];
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof FontWidths
   */
  endObject(): string[] {
    return ['endobj'];
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof FontWidths
   */
  compileWidths(): string[] {
    return ['[', this.Widths.join(' '), ']'];
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof FontWidths
   */
  compile(): string[] {
    return [
      ...this.startObject(),
      ...this.compileWidths(),
      ...this.endObject()
    ];
  }
}
