import '../bundle/miniviz.js';

export function start(props) {
  console.log("Starting MiniViz");
  CarbonVue.minivizWithProps(props).mount('#miniviz');
}
