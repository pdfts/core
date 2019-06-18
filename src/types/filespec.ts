import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';
import { EmbeddedFile } from './embeddedfile';

/**
 *
 *
 * @export
 * @class Filespec
 * @extends {PdfObject}
 */
export class Filespec extends PdfObject {
  constructor(
    public Id: number,
    public Generation: number,
    private _fileName: string,
    private _embeddedFile: EmbeddedFile
  ) {
    super();

    this.Type = PdfObjectType.Filespec;
  }

  /**
   *
   *
   * @returns
   * @memberof Filespec
   */
  compileUnprocessed() {
    // ToDo: uhm... ya... you know
    // /Desc removed
    return [
      '/Type /Filespec',
      '/AFRelationship /Unspecified',
      `/F (${this._fileName})`, // ! escaped filename
      `/UF (${this._fileName})`, // ! utf8 encoded filename
      `/EF <</F ${this._embeddedFile.Id} ${this._embeddedFile.Generation} R>>` // ToDo add embedded file reference
    ];
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof Filespec
   */
  compile(): string[] {
    return [
      ...this.startObject(),
      ...this.compileUnprocessed(),
      ...this.endObject()
    ];
  }
}
