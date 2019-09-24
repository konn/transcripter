export function parseTimeToSeconds(fmt: string): number {
  const segments = fmt.split(":");
  if (fmt.length > 1 && 1 <= segments.length && segments.length <= 3) {
    return segments.map(Number).reduce((l, r) => 60 * l + r);
  } else {
    throw Error("Time format must be of form [[HH:]MM:]SS.");
  }
}
