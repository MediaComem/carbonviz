export function roundToPrecision(val, precision = 2) {
  return parseFloat(val.toFixed(precision).toString());
}

export function formatSize(size, precision = 2) {
  if (size < 1000) {
    return `${ roundToPrecision(size, precision) } B`;
  } else if (size < 1000000) {
    return `${ roundToPrecision(size / 1000, precision) } kB`;
  } else if (size < 1000000000) {
    return `${ roundToPrecision(size / 1000000, precision) } MB`;
  } else {
    return `${ roundToPrecision(size / 1000000000, precision) } GB`;
  }
}

export function formatCo2(amount, precision = 2) {
  if (amount < 1) {
    return `${roundToPrecision(amount * 1000, precision)} mg`;
  } else if (amount < 1000) {
    return `${roundToPrecision(amount, precision)} g`;
  } else if (amount < 1000000) {
    return `${roundToPrecision(amount / 1000, precision)} kg`;
  } else {
    return `${roundToPrecision(amount / 1000000, precision)} Mg`;
  }
}