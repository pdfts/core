import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';
import { Sig } from './sig';
import { PdfObjectReference } from '../base/pdfobjectreference';
import { TextEncoder } from 'util';

/**
 *
 *
 * @export
 * @class Annot
 * @extends {PdfObject}
 */
export class Annot extends PdfObject {
  /**
   *Creates an instance of Annot.
   * @param {number} Id
   * @param {number} Generation
   * @memberof Annot
   */
  constructor(
    public Id: number,
    public Generation: number,
    private signature: Sig,
    private pageReference: PdfObjectReference
  ) {
    super();

    this.Type = PdfObjectType.Sig;
  }

  /**
   *
   *
   * @returns
   * @memberof Annot
   */
  compileUnprocessed() {
    let utf8Encode = new TextEncoder();

    // ToDo: uhm... ya... you know
    // /Desc removed
    return [
      `/Type /Annot`,
      `/Subtype /Text`,
      `/FT /Sig`,
      `/Rect [0 0 100 100]`,
      `/V ${this.signature.Id} ${this.signature.Generation} R`,
      `/T (Signature9)`,
      /*`/F 4`,*/
      `/P ${this.pageReference.Id} ${this.pageReference.Generation} R`
    ];
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof Annot
   */
  compile(): string[] {
    return [
      ...this.startObject(),
      ...this.compileUnprocessed(),
      ...this.endObject()
    ];
  }
}
