const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'in',
  'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'to', 'with', 'via',
  'their', 'they', 'this', 'into', 'across', 'using', 'based', 'through',
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

export function buildVocabulary(documents: string[]): string[] {
  const vocab = new Set<string>();
  for (const doc of documents) {
    for (const token of tokenize(doc)) {
      vocab.add(token);
    }
  }
  return [...vocab].sort();
}

export function documentToVector(tokens: string[], vocabulary: string[]): number[] {
  const vec = new Array(vocabulary.length).fill(0);
  for (const token of tokens) {
    const idx = vocabulary.indexOf(token);
    if (idx >= 0) vec[idx] += 1;
  }
  return vec;
}

export function buildDocumentMatrix(documents: string[]): number[][] {
  const vocabulary = buildVocabulary(documents);
  return documents.map((doc) => documentToVector(tokenize(doc), vocabulary));
}

function dot(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

function matVecMul(matrix: number[][], vec: number[]): number[] {
  return matrix.map((row) => dot(row, vec));
}

function normalize(vec: number[]): number[] {
  const norm = Math.sqrt(dot(vec, vec)) || 1;
  return vec.map((v) => v / norm);
}

function buildGramMatrix(matrix: number[][]): number[][] {
  const n = matrix[0]?.length ?? 0;
  const gram: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const row of matrix) {
    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        gram[i][j] += row[i] * row[j];
        if (i !== j) gram[j][i] = gram[i][j];
      }
    }
  }
  return gram;
}

function topEigenvectors(gram: number[][], k: number): number[][] {
  const working = gram.map((row) => [...row]);
  const eigenvectors: number[][] = [];
  const n = gram.length;

  for (let comp = 0; comp < Math.min(k, n); comp++) {
    let v = normalize(Array.from({ length: n }, () => Math.random() - 0.5));
    for (let iter = 0; iter < 100; iter++) {
      v = normalize(matVecMul(working, v));
    }
    const lambda = dot(v, matVecMul(working, v));
    eigenvectors.push(v);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        working[i][j] -= lambda * v[i] * v[j];
      }
    }
  }

  return eigenvectors;
}

export function pca2D(matrix: number[][]): { x: number[]; y: number[] } {
  const m = matrix.length;
  if (m === 0) return { x: [], y: [] };
  const n = matrix[0]?.length ?? 0;
  if (n === 0) return { x: matrix.map(() => 0), y: matrix.map(() => 0) };

  const means = new Array(n).fill(0);
  for (const row of matrix) {
    for (let j = 0; j < n; j++) means[j] += row[j];
  }
  for (let j = 0; j < n; j++) means[j] /= m;

  const centered = matrix.map((row) => row.map((v, j) => v - means[j]));
  const gram = buildGramMatrix(centered);
  const [pc1, pc2] = topEigenvectors(gram, 2);
  const first = pc1 ?? new Array(n).fill(1);
  const second = pc2 ?? new Array(n).fill(0);

  return {
    x: centered.map((row) => dot(row, first)),
    y: centered.map((row) => dot(row, second)),
  };
}

export function scaleCoordinates(values: number[], targetSpread = 400): number[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const mid = (min + max) / 2;
  return values.map((v) => ((v - mid) / range) * targetSpread);
}

export const EMBEDDING_MODEL = 'bag-of-words-v1';
export const LAYOUT_METHOD = 'pca-2d-v1';
