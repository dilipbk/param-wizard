export class URLParamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "URLParamError";
  }
}
