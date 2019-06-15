/**
 *
 *
 * @export
 * @class Header
 */
export class Header {
  private version: number;

  /**
   * header
   *
   * @param {number} version
   * @memberof Header
   */
  constructor(version: number) {
    this.version = version;
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof Header
   */
  compile(): string[] {
    return [`%PDF-${this.version.toFixed(1)}`, '%\xFF\xFF\xFF\xFF', ''];
  }

  /**
   *
   *
   * @returns
   * @memberof Header
   */
  toJson() {
    return {
      type: '...',
      header: `%PDF-${this.version.toFixed(1)}`
    };
  }
}
