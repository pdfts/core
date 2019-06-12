/**
 *
 *
 * @export
 * @enum {number}
 */
export enum PageOrientation {
  Portrait,
  Landscape
}

/**
 *
 *
 * @export
 * @class PageSize
 */
export class PageSize {
  public width: number;
  public height: number;
}

/**
 *
 *
 * @export
 * @abstract
 * @class PageSizes
 */
export abstract class PageSizes {
  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static X4A0: PageSize = {
    width: 4767.87,
    height: 6740.79
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static X2A0: PageSize = {
    width: 3370.39,
    height: 4767.87
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static A0: PageSize = {
    width: 2383.94,
    height: 3370.39
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static A1: PageSize = {
    width: 1683.78,
    height: 2383.94
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static A2: PageSize = {
    width: 1190.55,
    height: 1683.78
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static A3: PageSize = { width: 841.89, height: 1190.55 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static A4: PageSize = { width: 595.28, height: 841.89 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static A5: PageSize = { width: 419.53, height: 595.28 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static A6: PageSize = { width: 297.64, height: 419.53 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static A7: PageSize = { width: 209.76, height: 297.64 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static A8: PageSize = { width: 147.4, height: 209.76 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static A9: PageSize = { width: 104.88, height: 147.4 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static A10: PageSize = { width: 73.7, height: 104.88 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static B0: PageSize = {
    width: 2834.65,
    height: 4008.19
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static B1: PageSize = {
    width: 2004.09,
    height: 2834.65
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static B2: PageSize = {
    width: 1417.32,
    height: 2004.09
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static B3: PageSize = {
    width: 1000.63,
    height: 1417.32
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static B4: PageSize = { width: 708.66, height: 1000.63 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static B5: PageSize = { width: 498.9, height: 708.66 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static B6: PageSize = { width: 354.33, height: 498.9 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static B7: PageSize = { width: 249.45, height: 354.33 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static B8: PageSize = { width: 175.75, height: 249.45 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static B9: PageSize = { width: 124.72, height: 175.75 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static B10: PageSize = { width: 87.87, height: 124.72 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static C0: PageSize = {
    width: 2599.37,
    height: 3676.54
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static C1: PageSize = {
    width: 1836.85,
    height: 2599.37
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static C2: PageSize = {
    width: 1298.27,
    height: 1836.85
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static C3: PageSize = { width: 918.43, height: 1298.27 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static C4: PageSize = { width: 649.13, height: 918.43 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static C5: PageSize = { width: 459.21, height: 649.13 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static C6: PageSize = { width: 323.15, height: 459.21 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static C7: PageSize = { width: 229.61, height: 323.15 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static C8: PageSize = { width: 161.57, height: 229.61 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static C9: PageSize = { width: 113.39, height: 161.57 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static C10: PageSize = { width: 79.37, height: 113.39 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static RA0: PageSize = {
    width: 2437.8,
    height: 3458.27
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static RA1: PageSize = {
    width: 1729.13,
    height: 2437.8
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static RA2: PageSize = {
    width: 1218.9,
    height: 1729.13
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static RA3: PageSize = { width: 864.57, height: 1218.9 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static RA4: PageSize = { width: 609.45, height: 864.57 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static SRA0: PageSize = {
    width: 2551.18,
    height: 3628.35
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static SRA1: PageSize = {
    width: 1814.17,
    height: 2551.18
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static SRA2: PageSize = {
    width: 1275.59,
    height: 1814.17
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static SRA3: PageSize = {
    width: 907.09,
    height: 1275.59
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static SRA4: PageSize = { width: 637.8, height: 907.09 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static EXECUTIVE: PageSize = {
    width: 521.86,
    height: 756.0
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static FOLIO: PageSize = { width: 612.0, height: 936.0 };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static LEGAL: PageSize = {
    width: 612.0,
    height: 1008.0
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static LETTER: PageSize = {
    width: 612.0,
    height: 792.0
  };

  /**
   *
   *
   * @static
   * @type {PageSize}
   * @memberof PageSizes
   */
  public static TABLOID: PageSize = {
    width: 792.0,
    height: 1224.0
  };
}
