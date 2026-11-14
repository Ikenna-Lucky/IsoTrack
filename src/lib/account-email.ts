export function accountEmailToken(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const tokens = params.getAll("token");
  return tokens.length === 1 && /^[A-Za-z0-9_-]{43}\.[A-Za-z0-9_-]{43}$/.test(tokens[0] ?? "")
    ? tokens[0]!
    : null;
}
