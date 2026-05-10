import { createHash } from "crypto";

// Deterministic, lightweight local embedding for development/fallback.
// Produces a fixed-dimension vector of numbers in [-1,1].
export function embedTextLocal(text: string, dim = 256): number[] {
  const out: number[] = new Array(dim);
  for (let i = 0; i < dim; i++) {
    const h = createHash("sha256");
    h.update(text);
    h.update(String(i));
    const digest = h.digest("hex").slice(0, 16); // 64 bits
    // parse as integer and normalize
    const intVal = parseInt(digest, 16);
    // `max` not needed here; keep normalization simple without BigInt literals
    // map to [-1,1]
    const v = ((intVal % 1000000) / 1000000) * 2 - 1;
    out[i] = v;
  }

  // normalize vector to unit length
  let norm = 0;
  for (let i = 0; i < dim; i++) norm += out[i] * out[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < dim; i++) out[i] = out[i] / norm;
  return out;
}
