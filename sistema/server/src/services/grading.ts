export function popcount(n: number): number {
  let x = n >>> 0;
  let c = 0;
  while (x) {
    x &= x - 1;
    c++;
  }
  return c;
}

export function flexibleScoreRatio(
  expectedSum: number,
  studentSum: number
): number {
  const correctMask = expectedSum >>> 0;
  const studentMask = studentSum >>> 0;

  const correctBits = popcount(correctMask);
  if (correctBits === 0) return studentMask === 0 ? 1 : 0;

  const maskAll = correctMask | studentMask;
  const tp = popcount(studentMask & correctMask);
  const fp = popcount(studentMask & (maskAll ^ correctMask));

  const ratio = (tp - fp) / correctBits;
  return Math.max(0, Math.min(1, ratio));
}

