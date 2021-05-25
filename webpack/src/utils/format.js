export function roundToPrecision(val, precision = 2) {
  return parseFloat(val.toFixed(precision).toString());
}

export function formatSize(size, precision = 2) {
  if (size < 1000) {
    return `${ roundToPrecision(size, precision) } B`;
  } else if (size < 1000000) {
    return `${ roundToPrecision(size / 1000, precision) } KB`;
  } else if (size < 1000000000) {
    return `${ roundToPrecision(size / 1000000, precision) } MB`;
  } else {
    return `${ roundToPrecision(size / 1000000000, precision) } GB`;
  }
}

export function formatCo2(amount, precision = 2) {
  return `${roundToPrecision(1000 * amount, precision)} g`;
}