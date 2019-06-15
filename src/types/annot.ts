import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';

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
  constructor(public Id: number, public Generation: number) {
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
    // ToDo: uhm... ya... you know
    // /Desc removed
    return [
      '/Type Annot',
      '/Subtype Widget',
      '/Subfilter adbe.pkcs7.detached',
      '/ByteRange [ 0 ********** ********** ********** ]',
      '/Contents 8192',
      '/Reason ?',
      '/M ?'
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
