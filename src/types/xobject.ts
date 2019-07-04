import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';
import { Image } from './subtypes/image';
import { Palette } from './palette';

export class XObject extends PdfObject {
  public Stream: string;
  public Palette: Palette;

  constructor(public Id: number, public Generation: number) {
    super();

    this.Type = PdfObjectType.Sig;
  }

  compileUnprocessed() {
    const image = new Image(this.Stream);
    this.Palette.Stream = image.Palette;
    image.PaletteReference = {
      Id: this.Palette.Id,
      Generation: this.Palette.Generation
    };

    return ['/Type /XObject', ...image.Compile()];
  }

  endObject(): string[] {
    return ['endobj'];
  }

  compile(): string[] {
    return [
      ...this.startObject(),
      ...this.compileUnprocessed(),
      ...this.endObject()
    ];
  }
}
