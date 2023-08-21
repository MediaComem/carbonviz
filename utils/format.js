const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function roundToPrecision(val, precision = 2) {
  if (!val) {
    return;
  }
  return parseFloat(val.toFixed(precision).toString());
}

function formatSize(size, precision = 2) {
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

function formatCo2(amount, precision = 2) {
  if (amount < 1e-3) {
    return `${roundToPrecision(amount * 1e6, precision)} mg`;
  } else if (amount < 1) {
    return `${roundToPrecision(amount * 1e3, precision)} g`;
  } else if (amount < 1000) {
    return `${roundToPrecision(amount, precision)} Kg`;
  } else {
    return `${roundToPrecision(amount / 1000, precision)} T`;
  }
}

export { days, roundToPrecision, formatSize, formatCo2 }