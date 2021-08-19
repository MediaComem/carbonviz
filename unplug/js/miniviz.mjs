import Loop from './modules/mainloop.mjs';
import {genVariation} from './modules/utils.mjs';
import PubSub from './modules/pubsub.mjs';

const conf = {
  width: 50,
  height: 300,
  background: 'transparent',
  borderRadius: '25px',
  gravity: 0.00003,
  lifetime: 12000,
  variation: 3000,
  maskNoCollision: '0x0010',
  asset: {
    url: 'unplug/assets/co2.png',
    radius: 34
  },
  // chunks radius are the same as the popup ones divided by 2
  chunks: {
    co2   : [500, 300, 100, 50, 10, 5, 1, 0.5, 0.3, 0.1],  // CO2 chunk in [mg]
    radius: [10 ,   9,   8,  7,  5, 4, 2,   2,   1,   1],  // Chunk radius in pixels
    maxBySpawn: 6, // max nb of chunks for an entry
    maxTotal: 300 // max nb of chunks allowed in all the animation
  }
};


let engine;
let render;
let mainLoop;

const pubSub = new PubSub();
pubSub.subscribe('input-data', input => chunkifyCo2(input));

export default function () {
  initMatter();
  initMainLoop();
  initComputerConsumption();
}

function initMatter() {
  engine = Matter.Engine.create();
  engine.world.gravity.scale = 0; // remove Matter.js default gravity
  render = Matter.Render.create({
    element: document.getElementById("miniViz_container"),
    engine,
    options: {
      width: conf.width,
      height: conf.height,
      hasBounds: true,
      wireframes: false,
      background: conf.background
    }
  });
  // restet css cascading for the canvas
  render.canvas.style.all = 'initial';
  render.canvas.style.borderRadius = conf.borderRadius;
  // build walls around the canvas
  // let upperWall = Matter.Bodies.rectangle(0, -1, render.options.width * 2, 1, {isStatic: true, label: 'wall'});
  let leftWall = Matter.Bodies.rectangle(-1, -1, 1, render.options.height * 2, {isStatic: true, label: 'wall'});
  let rightWall = Matter.Bodies.rectangle(render.options.width + 1, -1, 1, render.options.height * 2, {isStatic: true, label: 'wall'});
  Matter.World.add(engine.world, [leftWall, rightWall]);
  //Matter.World.add(engine.world, [upperWall, leftWall, rightWall]);
}

function initMainLoop() {
  mainLoop = new Loop({
    update: (delta, elapsedt, lastDelta) => {
      const bodies = Matter.Composite.allBodies(engine.world);
      // the label of each bodies tell us which gravity rule to use
      bodies.forEach(body => {
        if (body.label == 'wall') return; // walls doesn't moves !
        let force = {x: 0, y: -body.mass * conf.gravity};
        Matter.Body.applyForce(body, body.position, force);
        // apply opacity for a disapearing effect
        body.render.opacity = Math.max(0, body.position.y / conf.height);
      });
      const correction = (lastDelta == 0) ? 1 : delta / lastDelta;
      Matter.Engine.update(engine, delta, correction);
    },
    draw: (delta) => {
      Matter.Render.world(render);
    }
  });
  mainLoop.start();
}

function generateCO2(radius = 10) {
  let opt = {
    render: { sprite: {
      texture: chrome.extension.getURL(conf.asset.url),
      xScale: radius / conf.asset.radius,
      yScale: radius / conf.asset.radius,
    }},
    label: 'co2'
  };
  let co2 = Matter.Bodies.circle(conf.width / 2 + genVariation(5), conf.height - radius, radius, opt);
  Matter.World.add(engine.world, co2);
  let disapearT = conf.lifetime + genVariation(conf.variation);
  mainLoop.setTimeout(disapearT, () => disapearEntity(co2));
}

function disapearEntity(entity) {
  entity.collisionFilter.mask = conf.maskNoCollision;
  mainLoop.setTimeout(2000, () => Matter.World.remove(engine.world, entity));
}

function initComputerConsumption() {
  // doesn't need to calculate, it's a constant value: ~6.57 [mg/sec]
  generateCO2(7); //all radius are divided by 2 in the miniviz animation, 6 here because every ~4 sec = 26.28 [mg] => radius of
  CarbonVue.co2DataCounter.co2 += 6.57e-6 * 2;
  mainLoop.setTimeout(4000 + genVariation(2000), () => initComputerConsumption());
}

function chunkifyCo2(input) {
  let co2 = input.co2 * 1000000; // co2 emission: [kg]  to [mg]
  let spawnChunks = 0;
  for (let i=0; i < conf.chunks.co2.length; i++) {
    let chunkSize = conf.chunks.co2[i];
    let radius = conf.chunks.radius[i];
    let nchunks = Math.floor(co2 / chunkSize);
    co2 %= chunkSize;
    for (let j = 0; j < nchunks; j++) {
      let nbEntities = Matter.Composite.allBodies(engine.world).length;
      if (nbEntities >= conf.chunks.maxTotal) return;
      generateCO2(radius);
      spawnChunks++;
      if (spawnChunks >= conf.chunks.maxBySpawn) return;
    }
  }
  // currently ignoring very small chunks (uncomment the following show them)
  // if (input.co2 * 1000000 <= co2) generateCO2(1);
}