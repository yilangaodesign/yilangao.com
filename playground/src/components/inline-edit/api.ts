/**
 * Playground stubs for CMS inline-edit API functions.
 *
 * These exist so that site components imported via @site/* (which reference
 * @/components/inline-edit/api) resolve in the playground context. They are
 * never called at runtime since the playground renders with isAdmin=false.
 *
 * Source of truth: src/components/inline-edit/api.ts — keep signatures in sync.
 */

export async function uploadMedia(
  _file: File,
  _alt?: string,
): Promise<{ id: number; url: string }> {
  throw new Error("uploadMedia is not available in the playground");
}

export async function updateCollectionField(
  _slug: string,
  _id: number,
  _fieldPath: string,
  _value: unknown,
): Promise<void> {
  throw new Error("updateCollectionField is not available in the playground");
}
