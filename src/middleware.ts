import { URLMiddleware } from "./@types";

// Middleware System
export class URLMiddlewareManager {
  private static middlewares: URLMiddleware[] = [];

  static use(middleware: URLMiddleware): void {
    this.middlewares.push(middleware);
  }

  static execute(params: Record<string, string>): void {
    const executeMiddleware = (index: number): void => {
      if (index < this.middlewares.length) {
        this.middlewares[index](params, () => executeMiddleware(index + 1));
      }
    };
    executeMiddleware(0);
  }
}
