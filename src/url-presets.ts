import { updateQueries } from "./base-utils";

// Query Parameter Presets
export class URLPresets {
  private static presets: Record<string, Record<string, string>> = {};

  static save(name: string, params: Record<string, string>): void {
    this.presets[name] = { ...params };
  }

  static apply(name: string): void {
    const preset = this.presets[name];
    if (preset) {
      updateQueries(
        Object.entries(preset).map(([key, value]: [string, any]) => ({
          key,
          value,
        }))
      );
    }
  }

  static remove(name: string): void {
    delete this.presets[name];
  }
}
