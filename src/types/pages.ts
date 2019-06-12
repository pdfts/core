import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';
import { PdfObjectReference } from '../base/pdfobjectreference';

export class Pages extends PdfObject {
  constructor(
    public Id: number,
    public Generation: number,
    public Kids?: PdfObjectReference[]
  ) {
    super();

    this.Type = PdfObjectType.Pages;
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof Pages
   */
  compileSubPages(): string[] {
    if (!this.Kids || this.Kids.length === 0) {
      return [];
    }

    let kids: string[] = [];
    this.Kids.forEach(kid => {
      kids.push(`  ${kid.Id} ${kid.Generation} R`);
    });

    return ['/Kids [', ...kids, ']'];
  }

  compileCount(): string {
    if (!this.Kids || this.Kids.length === 0) {
      return '';
    }

    return `/Count ${this.Kids!.length}`;
  }

  compile(): string[] {
    return [
      ...this.startObject(),
      this.compileType(),
      ...this.compileSubPages(),
      this.compileCount(),
      ...this.endObject()
    ];
  }
}
