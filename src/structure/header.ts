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

  compile(): string[] {
    return [`%PDF-${this.version.toFixed(1)}`, '%\xFF\xFF\xFF\xFF', ''];
  }

  toJson() {
    return {
      type: '...',
      header: `%PDF-${this.version.toFixed(1)}`
    };
  }
}
