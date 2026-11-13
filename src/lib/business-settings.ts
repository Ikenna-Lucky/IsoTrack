/** Send only edited keys so unrelated stored settings survive a save. */
export function changedSettings<T extends object>(baseline: T, draft: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(draft).filter(
      ([key, value]) => JSON.stringify(value) !== JSON.stringify(baseline[key as keyof T]),
    ),
  ) as Partial<T>;
}

export function passwordProblem(value: string): string | null {
  if (value.length < 8 || value.length > 72 || new TextEncoder().encode(value).length > 72)
    return "Use 8–72 characters and no more than 72 UTF-8 bytes.";
  if (!/[A-Z]/.test(value) || !/[0-9]/.test(value))
    return "Include an uppercase letter and a number.";
  return null;
}
