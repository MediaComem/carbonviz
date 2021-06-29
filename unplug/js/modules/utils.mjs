export function genVariation(variation) {
  return Math.floor(Matter.Common.random(- variation / 2, variation / 2));
}
