import { Header } from './structure/header';
import { Trailer } from './structure/trailer';
import { Xref } from './structure/xref';
import { PdfObject } from './base/pdfobject';

import * as ObjectTypes from './base/pdfobjecttypes';
import { PageSize, PageOrientation } from './pagesizes';
import { ControlCharacters } from './controlcharacters';
import { Pages, Catalog } from './base/pdfobjecttypes';
import { FontDescriptor } from './types/fontdescriptor';
import { Font } from './types/font';
import { FontWidths } from './types/fontwidths';
import { FontEncoding } from './types/fontencoding';
import { FontFile } from './types/fontfile';
import { Diverda } from './fonts/diverda';
import { Filespec } from './types/filespec';
import { EmbeddedFile } from './types/embeddedfile';
import { Names } from './types/names';

export class PDFDocument {
  private header: Header;
  private objects: PdfObject[] = [];
  private pagesDictionary: Pages;
  private catalog: Catalog;
  private names: Names;
  private patches: any[] = []; // not yet defined
  private trailer: Trailer; // not yet defined
  private xref: Xref; // not yet defined

  constructor(private pagesize: PageSize) {
    //}, options?, text?) {
    // ToDo: decide if we need a header object since its just 2 lines and a fixed version number
    // ! PDF/A-3 with file attachments becomes PDF/A-4f
    this.header = new Header(1.7); // ToDo Update to 2.0 as soon as PDF/A-4 hits
    this.trailer = new Trailer();

    // ! initialize first page a bit more elegant please
    this.catalog = new ObjectTypes.Catalog(this.objects.length + 1, 0);
    this.objects.push(this.catalog);

    this.names = new Names(this.objects.length + 1, 0, []);
    this.catalog.attachments.push(this.names);
    this.objects.push(this.names);

    this.pagesDictionary = new ObjectTypes.Pages(this.objects.length + 1, 0);
    this.objects.push(this.pagesDictionary);

    let page = new ObjectTypes.Page(this.objects.length + 1, 0, pagesize);
    this.objects.push(page);

    let meta = new ObjectTypes.MetaData(this.objects.length + 1, 0);
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
   * returns a string with the current file content
   *
   * @returns {string}
   * @memberof PDFDocument
   */
  compile(): string {
    let file: string = '';
    let utf8Encode = new TextEncoder();

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
        Position: utf8Encode.encode(file).length,
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
    this.xref.Offset = utf8Encode.encode(file).length;

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

  addPage(
    pagesize: PageSize,
    pageOrientation: PageOrientation = PageOrientation.Portrait,
    needle?: number
  ): PDFDocument {
    let page = new ObjectTypes.Page(
      this.objects.length + 1,
      0,
      pagesize,
      pageOrientation
    );

    this.pagesDictionary.Kids.push({
      Id: page.Id,
      Generation: page.Generation
    });

    page.Parent = {
      Id: this.pagesDictionary.Id,
      Generation: this.pagesDictionary.Generation
    };

    this.objects.push(page);

    return this;
  }
  addPages(count: number, needle?: number): PDFDocument {
    return this;
  }
  removePage(index: number): PDFDocument {
    return this;
  }
  removePages(count: number, needle?: number): PDFDocument {
    return this;
  }
  gotoPage(index: number): PDFDocument {
    return this;
  }
  text(): PDFDocument {
    return this;
  }
  pageBreak(): PDFDocument {
    return this;
  }

  // .addAttachment('helloworld.txt', 'Hello World!!!')
  addAttachment(fileName: string, fileContent: string) {
    let embeddedfile = new EmbeddedFile(
      this.objects.length + 1,
      0,
      fileName,
      fileContent
    );
    this.objects.push(embeddedfile);

    let filespec = new Filespec(
      this.objects.length + 1,
      0,
      fileName,
      embeddedfile
    );
    this.objects.push(filespec);

    this.names.NamedReferences.push(filespec);

    return this;
  }

  // .addFont('diverda')
  addFont(fontName: string) {
    let fontFile = new FontFile(
      this.objects.length + 1,
      0,
      fontName,
      Diverda.data
    );
    this.objects.push(fontFile);

    let fontDescriptor = new FontDescriptor(
      this.objects.length + 1,
      0,
      fontName,
      fontFile
    );
    this.objects.push(fontDescriptor);

    let fontWidths = new FontWidths(this.objects.length + 1, 0, fontName);
    this.objects.push(fontWidths);

    let fontEncoding = new FontEncoding(this.objects.length + 1, 0);
    this.objects.push(fontEncoding);

    let font = new Font(
      this.objects.length + 1,
      0,
      fontDescriptor,
      fontWidths,
      fontEncoding
    );
    this.objects.push(font);

    return this;
  }
}
