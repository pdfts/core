import { PDFDocument } from './pdfdocument';
import { PageSizes, PageSize, PageOrientation } from './pagesizes';

(function() {
  let w: any = window;
  w.PDFDocument = PDFDocument;
  w.PageSizes = PageSizes;
  w.PageSize = PageSize;
  w.PageOrientation = PageOrientation;
})();
