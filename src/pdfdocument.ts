import { Header } from './structure/header';
import { Trailer } from './structure/trailer';
import { Xref } from './structure/xref';
import { PdfObject } from './base/pdfobject';

import * as ObjectTypes from './base/pdfobjecttypes';
import { PageSize, PageOrientation } from './pagesizes';
import { ControlCharacters } from './controlcharacters';
import { Pages, Catalog, Page } from './base/pdfobjecttypes';
import { FontDescriptor } from './types/fontdescriptor';
import { Font } from './types/font';
import { FontFile } from './types/fontfile';
import { Filespec } from './types/filespec';
import { EmbeddedFile } from './types/embeddedfile';
import { Names } from './types/names';

import { TextEncoder } from 'util';

import diverda = require('./fonts/diverda.json');
import times = require('./fonts/times-roman.json');
import { PdfObjectReference } from './base/pdfobjectreference';
import { Content } from './types/content';
import { StandardFonts } from './base/standardfonts';
import { Sig } from './types/sig';
import { Annot } from './types/annot';
import { AcroForm } from './types/acroform';
import { XObject } from './types/xobject';
import { Palette } from './types/palette';

/**
 * This is what we want. A PDF Document :3
 *
 * @export
 * @class PDFDocument
 */
export class PDFDocument {
  private fontFiles = <any>[];
  private fonts: Font[] = [];

  private header: Header;
  private objects: PdfObject[] = [];

  private pages: Page[] = [];
  private pagesDictionary: Pages;

  private catalog: Catalog;
  private names: Names;

  private patches: any[] = []; // not yet defined
  private trailer: Trailer; // not yet defined
  private xref: Xref; // not yet defined

  /**
   * Creates an instance of PDFDocument with a prefilled structure and one empty page.
   *
   * @param {PageSize} pagesize
   * @memberof PDFDocument
   */
  constructor(private pagesize: PageSize) {
    this.fontFiles.push(diverda);
    this.fontFiles.push(times);

    // ToDo: decide if we need a header object since its just 2 lines and a fixed version number
    // ! PDF/A-3 with file attachments becomes PDF/A-4f
    this.header = new Header(1.7); // ToDo Update to 2.0 as soon as PDF/A-4 hits
    this.trailer = new Trailer();

    // ! initialize first page a bit more elegant please
    this.catalog = new ObjectTypes.Catalog(this.nextObjectId, 0);
    this.objects.push(this.catalog);

    this.names = new Names(this.nextObjectId, 0, []);
    this.catalog.Attachments.push(this.names);
    this.objects.push(this.names);

    this.pagesDictionary = new ObjectTypes.Pages(this.nextObjectId, 0);
    this.objects.push(this.pagesDictionary);

    let page = new ObjectTypes.Page(this.nextObjectId, 0, pagesize);
    page.Fonts = this.fonts;
    this.pages.push(page);
    this.objects.push(page);

    let meta = new ObjectTypes.MetaData(this.nextObjectId, 0);
    this.objects.push(meta);

    this.catalog.Pages = {
      Id: this.pagesDictionary.Id,
      Generation: this.pagesDictionary.Generation
    };

    this.catalog.MetaData = {
      Id: meta.Id,
      Generation: meta.Generation
    };

    this.pagesDictionary.Kids = [
      {
        Id: page.Id,
        Generation: page.Generation
      }
    ];

    page.Parent = {
      Id: this.pagesDictionary.Id,
      Generation: this.pagesDictionary.Generation
    };
  }

  /**
   * Getter to determine the next available object Id
   *
   *
   * @readonly
   * @type {number}
   * @memberof PDFDocument
   */
  get nextObjectId(): number {
    var taken = this.objects.find(object => {
      return object.Id === this.objects.length + 1;
    });

    if (!taken) {
      return this.objects.length + 1;
    }

    // ? haven't had this issue yet but it might be possible
    // ? let's find a way to handle it when we encounter this error
    throw 'Object ID already taken. If you encounter this Error, please create an Issue on github with an example PDF';
  }

  /**
   * returns a string with the current file content
   *
   * @returns {string}
   * @memberof PDFDocument
   */
  compile(): string {
    let file: string = '';

    this.xref = new Xref();
    this.xref.Offsets = [];

    // default xref entry
    this.xref.Offsets.push({
      Position: 0,
      Generation: 65535,
      Free: true
    });

    // #region header
    file +=
      this.header.compile().join(ControlCharacters.EOL) + ControlCharacters.EOL;
    // #endregion

    // #region objects
    this.objects.forEach(object => {
      this.xref.Offsets.push({
        Position: file.length,
        Generation: object.Generation,
        Free: false
      });
      file += object.compile().join(ControlCharacters.EOL);
      file += ControlCharacters.EOL;
      file += ControlCharacters.EOL; // and one extra line after each object to have a nice and readable document
    });
    // #endregion

    // #region xref
    // set xref offset right before we compile the xref table
    this.xref.Offset = file.length;

    file += 'xref' + ControlCharacters.EOL;
    file += 0 + ' ' + this.xref.Offsets.length + ControlCharacters.EOL;

    this.xref.Offsets.sort((obj1, obj2) => {
      if (obj1.Position > obj2.Position) {
        return 1;
      }

      if (obj1.Position < obj2.Position) {
        return -1;
      }

      return 0;
    }).forEach(offset => {
      file +=
        ('0000000000' + offset.Position).slice(-10) +
        ' ' +
        ('00000' + offset.Generation).slice(-5) +
        ' ' +
        (offset.Free ? 'f' : 'n') +
        ControlCharacters.EOL;
    });
    // #endregion

    // ToDo: add file patches

    // ToDo: generate actual trailer
    // #region trailer
    file += this.trailer
      .compile(this.xref.Offsets.length, this.xref.Offset)
      .join(ControlCharacters.EOL);
    // #endregion

    // end of file!
    file += ControlCharacters.EOL;
    file += '%%EOF';

    return file;
  }

  /**
   * returns the object type of the document
   *
   * @returns {string}
   * @memberof PDFDocument
   */
  toString(): string {
    return '[object PDFDocument]';
  }

  /**
   * Append a new and empty page to the PDF.
   *
   * @param {PageSize} pagesize
   * @param {PageOrientation} [pageOrientation=PageOrientation.Portrait]
   * @param {number} [needle]
   * @returns {PDFDocument}
   * @memberof PDFDocument
   */
  addPage(
    pagesize: PageSize,
    pageOrientation: PageOrientation = PageOrientation.Portrait,
    needle?: number
  ): PDFDocument {
    let page = new ObjectTypes.Page(
      this.nextObjectId,
      0,
      pagesize,
      pageOrientation
    );

    page.Fonts = this.fonts;

    this.pagesDictionary.Kids.push({
      Id: page.Id,
      Generation: page.Generation
    });

    page.Parent = {
      Id: this.pagesDictionary.Id,
      Generation: this.pagesDictionary.Generation
    };

    this.pages.push(page);
    this.objects.push(page);

    return this;
  }

  /**
   * Adds an Attachment to the PDF
   * (does not upload or load from filesystem!)
   *
   * @param {string} fileName
   * @param {string} fileContent
   * @returns
   * @memberof PDFDocument
   */
  addAttachment(fileName: string, fileContent: string) {
    let embeddedfile = new EmbeddedFile(
      this.nextObjectId,
      0,
      fileName,
      fileContent
    );
    this.objects.push(embeddedfile);

    let filespec = new Filespec(this.nextObjectId, 0, fileName, embeddedfile);
    this.objects.push(filespec);

    this.names.NamedReferences.push(filespec);

    return this;
  }

  /**
   * embed a font into the pdf by the postscript name
   *
   * @param {string} fontName
   * @returns
   * @memberof PDFDocument
   */
  addFont(fontName: string): PDFDocument {
    let fontJSON = this.fontFiles.find((font: any) => {
      return font.BaseFont === fontName;
    });

    let fontFile = new FontFile(
      this.nextObjectId,
      0,
      fontJSON.Subtype,
      fontJSON.BaseFont,
      fontJSON.FirstChar,
      fontJSON.LastChar,
      fontJSON.FontDescriptor.FontFile2.Length,
      fontJSON.FontDescriptor.FontFile2.Length1,
      fontJSON.FontDescriptor.FontFile2.Stream
    );
    this.objects.push(fontFile);

    let fontDescriptor = new FontDescriptor(
      this.nextObjectId,
      0,
      fontJSON.FontDescriptor.FontName,
      fontJSON.FontDescriptor.FontFamily,
      fontJSON.FontDescriptor.FontStretch,
      fontJSON.FontDescriptor.FontWeight,
      fontJSON.FontDescriptor.Flags,
      fontJSON.FontDescriptor.FontBBox,
      fontJSON.FontDescriptor.ItalicAngle,
      fontJSON.FontDescriptor.Ascent,
      fontJSON.FontDescriptor.Descent,
      fontJSON.FontDescriptor.CapHeight,
      fontJSON.FontDescriptor.XHeight,
      fontJSON.FontDescriptor.StemV,
      fontJSON.FontDescriptor.AvgWidth,
      fontJSON.FontDescriptor.MaxWidth,
      fontFile
    );
    this.objects.push(fontDescriptor);

    let font = new Font(
      this.nextObjectId,
      0,
      fontFile,
      fontDescriptor,
      fontJSON.Widths
    );

    this.fonts.push(font);
    this.objects.push(font);

    return this;
  }

  /**
   * reference a top 14 font into the pdf by name
   * (does not conform the PDF/A standard since it does not embed the font program)
   *
   * @param {string} fontName
   * @returns
   * @memberof PDFDocument
   */
  addStandardFont(fontName: StandardFonts): PDFDocument {
    const font = new Font(
      this.nextObjectId,
      0,
      null,
      null,
      null,
      'Type1',
      fontName
    );
    this.fonts.push(font);
    this.objects.push(font);

    return this;
  }

  /**
   * not yet implemented
   *
   * @param {string} fontname
   * @param {number} fontweight
   * @param {number} fontsize
   * @returns {PDFDocument}
   * @memberof PDFDocument
   */
  setDefaultFont(
    fontname: string,
    fontweight: number,
    fontsize: number
  ): PDFDocument {
    return this;
  }

  /**
   * active page identifier
   *
   * @private
   * @type {number}
   * @memberof PDFDocument
   */
  private _activePage: number = 1;
  /**
   * active page setter
   *
   * @param {number} index
   * @memberof PDFDocument
   */
  setActivePage(index: number): PDFDocument {
    this._activePage = index;

    return this;
  }
  /**
   * active page getter
   *
   * @readonly
   * @type {PdfObjectReference}
   * @memberof PDFDocument
   */
  get ActivePage(): PdfObjectReference {
    return this.pagesDictionary.Kids[this._activePage - 1];
  }

  /**
   * add text to the current active page
   *
   * @param {string[]} text
   * @returns {PDFDocument}
   * @memberof PDFDocument
   */
  text(text: string[]): PDFDocument {
    const page: Page = this.pages.find(page => {
      return page.Id === this.ActivePage.Id;
    });

    let content = new Content(this.nextObjectId, 0);
    content.Stream = text;

    page.Contents.push(content);
    this.objects.push(content);

    return this;
  }

  /**
   * add a signature field to the document
   *
   * @param {string} fieldName
   * @param {Position} position
   * @param {*} [style]
   * @returns {PDFDocument}
   * @memberof PDFDocument
   */
  addSignatureField(imageData: Uint8Array): PDFDocument {
    const sig = new Sig(this.nextObjectId, 0);
    this.objects.push(sig);

    const annot = new Annot(this.nextObjectId, 0, sig, this.pages[0]);
    this.objects.push(annot);

    const acroForm = new AcroForm(this.nextObjectId, 0);
    acroForm.Fields.push(annot);
    this.objects.push(acroForm);

    this.pages[0].Annots.push(annot);

    // so weit funzt es

    const image = new XObject(this.nextObjectId, 0, 625, 156);
    image.Stream = imageData;
    this.objects.push(image);

    /*const palette = new Palette(this.nextObjectId, 0);
    this.objects.push(palette);

    image.Palette = palette;*/

    const page: Page = this.pages.find(page => {
      return page.Id === this.ActivePage.Id;
    });
    page.XObjects.push(image);

    return this;
  }

  /**
   * fill a signature field
   * (also attached biometric data as a file if provided)
   *
   * @param {string} fieldName
   * @param {ImageBitmap} image
   * @param {*} [biometrics]
   * @returns {PDFDocument}
   * @memberof PDFDocument
   */
  fillSignature(
    fieldName: string,
    image: ImageBitmap,
    biometrics?: any
  ): PDFDocument {
    return this;
  }

  sign(): PDFDocument {
    return this;
  }
}
