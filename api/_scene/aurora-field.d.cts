// Types for the vendored aurora-field (CommonJS copy). The browser uses the same library.
declare const AuroraField: {
  version: string;
  validate(board: unknown, options?: { text?: (value: string, path: string) => string | null | undefined }): { ok: boolean; errors: string[] };
  schema(options?: { strict?: boolean }): Record<string, unknown>;
  vocab(): { poses: string[]; props: string[]; actions: string[]; trades: string[]; palettes: string[]; joints: string[] };
  trades(): string[];
};
export = AuroraField;
