import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';

/**
 * An object containing an array of name object references
 *
 * @export
 * @class Names
 * @extends {PdfObject}
 */
export class Names extends PdfObject {
  constructor(
    public Id: number,
    public Generation: number,
    public NamedReferences: PdfObject[]
  ) {
    super();

    this.Type = PdfObjectType.Filespec;
  }

  /**
   *
   *
   * @returns
   * @memberof Names
   */
  compileUnprocessed() {
    // ToDo: uhm... ya... you know
    return [
      `/Names [ ${this.NamedReferences.map((ref, index) => {
        return `(${('test.txt' + index).slice(-3)}) ${ref.Id} ${
          ref.Generation
        } R`;
      }).join(' ')}]`
    ];
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof Names
   */
  compile(): string[] {
    return [
      ...this.startObject(),
      ...this.compileUnprocessed(),
      ...this.endObject()
    ];
  }
}
