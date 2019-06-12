import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';

export class Names extends PdfObject {
  constructor(
    public Id: number,
    public Generation: number,
    public NamedReferences: PdfObject[]
  ) {
    super();

    this.Type = PdfObjectType.Filespec;
  }

  compileUnprocessed() {
    // ToDo: uhm... ya... you know
    return [
      `/Names [ ${this.NamedReferences.map((ref, index) => {
        return `(${('000' + index).slice(-3)}) ${ref.Id} ${ref.Generation} R`;
      }).join(' ')}]`
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
