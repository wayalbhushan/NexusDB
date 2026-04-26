export function pca2D(X: number[][]): number[][] {
  if (!X || X.length === 0) return [];
  const n = X.length, d = X[0].length;
  const mu = new Array(d).fill(0);
  for (const x of X) for (let i = 0; i < d; i++) mu[i] += x[i] / n;
  X = X.map(x => x.map((v, i) => v - mu[i]));

  function powerIter(X: number[][], excl: number[] | null): number[] {
    let v = new Array(d).fill(0).map(() => Math.random() - 0.5);
    let nrm = Math.sqrt(v.reduce((s, vi) => s + vi * vi, 0));
    v = v.map(vi => vi / nrm);
    for (let iter = 0; iter < 100; iter++) {
      const nv = new Array(d).fill(0);
      for (let k = 0; k < n; k++) {
        const Xv_k = X[k].reduce((s, x_kj, j) => s + x_kj * v[j], 0);
        for (let j = 0; j < d; j++) nv[j] += X[k][j] * Xv_k;
      }
      if (excl) {
        let dot = nv.reduce((s, vi, i) => s + vi * excl[i], 0);
        for (let i = 0; i < d; i++) nv[i] -= dot * excl[i];
      }
      nrm = Math.sqrt(nv.reduce((s, vi) => s + vi * vi, 0));
      if (nrm < 1e-10) break;
      const prev = [...v];
      v = nv.map(vi => vi / nrm);
      if (v.reduce((s, vi, i) => s + (vi - prev[i]) ** 2, 0) < 1e-12) break;
    }
    return v;
  }
  const pc1 = powerIter(X, null);
  const pc2 = powerIter(X, pc1);
  return X.map(x => [
    x.reduce((s, v, i) => s + v * pc1[i], 0),
    x.reduce((s, v, i) => s + v * pc2[i], 0)
  ]);
}
