import { PdfObject } from '../base/pdfobject';
import { ControlCharacters } from '../controlcharacters';

export class AcroForm extends PdfObject {
  public Fields: PdfObject[] = [];

  constructor(public Id: number, public Generation: number) {
    super();

    this.Type = null;
  }

  compileSomething(): string[] {
    const fieldRefs = this.Fields.map((field, index) => {
      return ` ${field.Id} ${field.Generation} R`;
    });
    return [
      `/Type /AcroForm`,
      `/SigFlags 3`,
      `/Fields [ ${fieldRefs.join(ControlCharacters.sp)} ]`
    ];
  }

  compile(): string[] {
    return [
      ...this.startObject(),
      ...this.compileSomething(),
      ...this.endObject()
    ];
  }
}
