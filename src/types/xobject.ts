import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';
import { Image } from './subtypes/image';
import { Palette } from './palette';
import { ImageJPG } from './subtypes/image.jpg';

export class XObject extends PdfObject {
  public Stream: Uint8Array;
  public Palette: Palette;

  constructor(
    public Id: number,
    public Generation: number,
    public Width: number,
    public Height: number
  ) {
    super();

    this.Type = PdfObjectType.Sig;
  }

  compileUnprocessed() {
    const image = new ImageJPG(this.Stream, this.Width, this.Height);
    /*this.Palette.Stream = image.Palette;
    image.PaletteReference = {
      Id: this.Palette.Id,
      Generation: this.Palette.Generation
    };*/

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
