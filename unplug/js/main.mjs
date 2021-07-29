import Loop from './modules/mainloop.mjs';
import PubSub from './modules/pubsub.mjs';
import {genVariation} from './modules/utils.mjs';
import conf from './conf.mjs';

let DATA;
const pubSub = new PubSub();

// List of all UI actions
const uiActions = {
  'goUp': () => Matter.Bounds.translate(render.bounds, {x:0, y: -conf.pageHeight}),
  'goDown': () => Matter.Bounds.translate(render.bounds, {x:0, y: conf.pageHeight}),
}

// generate a random position {x, y} around the center of the animation
const genEntityPos = () => {
  let x = conf.width / 2 + genVariation(conf.spawnVariation);
  let y = conf.height / 2 + genVariation(conf.spawnVariation);
  return {x, y};
}

// generate statics walls (at the top and bottom)
const generateWalls = () => {
  let upperWall = Matter.Bodies.rectangle(0, -conf.pageHeight-1, render.options.width * 2, 1, { isStatic: true, label: 'wall' });
  let lowerWall = Matter.Bodies.rectangle(0, render.options.height + conf.pageHeight + 1, render.options.width * 2, 1, { isStatic: true, label: 'wall' });
  Matter.World.add(engine.world, upperWall);
  Matter.World.add(engine.world, lowerWall);
}

// generate a chunk of data as a dynamic Matter.js body
const generateData = (edge) => {
  let pos = genEntityPos();
  let opt = {...conf.matterOpts.data};
  opt.render.sprite.xScale = edge / conf.assets.edge;
  opt.render.sprite.yScale = edge / conf.assets.edge;
  let data =  Matter.Bodies.rectangle(pos.x, pos.y, edge, edge, opt);
  Matter.Body.rotate(data, Math.PI / 4);
  Matter.World.add(engine.world, data);
  mainLoop.setTimeout(conf.timers.drop + genVariation(conf.timers.variation.drop),
    () => fallingEntity(data)
  );
  // lifetime is edge dependant
  const minEdge = conf.chunks.edge[conf.chunks.edge.length - 1];
  const diffMaxEdge = conf.chunks.edge[0] - minEdge;
  const diffLifetime = conf.timers.maxLifetime - conf.timers.minLifetime;
  const diffEdge = edge - minEdge;
  const lifetime =  (diffEdge * diffLifetime / diffMaxEdge) + conf.timers.minLifetime;
  mainLoop.setTimeout(lifetime + genVariation(conf.timers.variation.lifetime),
    () => disapearEntity(data)
  );
  // backgroud deletion of old entities if the mainloop is not running
  if (!mainLoop.isRunning()) {
    setTimeout(() => {
      if (mainLoop.isRunning()) return;
      destroyEntity(data);
    }, conf.timers.bgDeleteAfter);
  }
  return data;
}

// generate a chunk of co2 as a dynamic Matter.js body
const generateCO2 = (radius) => {
  let pos = genEntityPos();
  let opt = {...conf.matterOpts.co2};
  opt.render.sprite.xScale = radius / conf.assets.radius;
  opt.render.sprite.yScale = radius / conf.assets.radius;
  let co2 = Matter.Bodies.circle(pos.x, pos.y, radius, opt);
  Matter.World.add(engine.world, co2);
  mainLoop.setTimeout(conf.timers.drop + genVariation(conf.timers.variation.drop),
    () => evaporateEntity(co2)
  );
  // lifetime is radius dependant
  const minRadius = conf.chunks.radius[conf.chunks.radius.length - 1];
  const diffMaxRadius = conf.chunks.radius[0] - minRadius;
  const diffLifetime = conf.timers.maxLifetime - conf.timers.minLifetime;
  const diffRadius = radius - minRadius;
  const lifetime =  (diffRadius * diffLifetime / diffMaxRadius) + conf.timers.minLifetime;
  mainLoop.setTimeout(lifetime + genVariation(conf.timers.variation.lifetime),
    () => disapearEntity(co2)
  );
  // backgroud deletion of old entities if the mainloop is not running
  if (!mainLoop.isRunning()) {
    setTimeout(() => {
      if (mainLoop.isRunning()) return;
      destroyEntity(co2);
    }, conf.timers.bgDeleteAfter);
  }
  return co2;
}

// mark the entity as "falling"
const fallingEntity = (entity) => {
  if (entity !== clickedChunk.body) {
    entity.collisionFilter.mask = conf.categories.default | conf.categories.data;
  } else {
    clickedChunk.mask = conf.categories.default | conf.categories.data;
  }
  entity.label = 'fall';
}

// mark the entity as "evaporating"
const evaporateEntity = (entity) => {
  if (entity !== clickedChunk.body) {
    entity.collisionFilter.mask = conf.categories.default | conf.categories.co2;
  } else {
    clickedChunk.mask = conf.categories.default | conf.categories.co2;
  }
  entity.label = 'evaporate';
}

// make the entity "escape" the scene and destroy it afterward
const disapearEntity = (entity) => {
  if (entity !== clickedChunk.body) {
    entity.collisionFilter.mask = conf.categories.nothing;
  } else {
    clickedChunk.mask = conf.categories.nothing;
  }
  mainLoop.setTimeout(conf.timers.bgDeleteAfter, () => destroyEntity(entity));
}

// remove the entity from the scene
const destroyEntity = (entity) => {
  if (entity === clickedChunk.body) {
    pubSub.publish('clear-selection', null);
    clickedChunk = {};
  }
  metaData.delete(entity);
  Matter.World.remove(engine.world, entity);
}

// draw the selection line for the meta data popup
const drawSelectionLine = (body, ctx) => {
  //if menu is outside off the screen, dosent draw the selection line
  if (window.document.querySelector('.menu').classList.contains('outside')) return;
  let center = body.position;
  ctx.strokeStyle = conf.assets.selectLine;
  ctx.fillStyle = conf.assets.selectCircle;
  ctx.lineWidth = 1;

  let x = conf.width - conf.rightPadding - conf.assets.selectCircleSize;
  let y = conf.height / 2 - 10;
  // remove height of the today histo startum
  if (CarbonVue.historyCO2.show) {
    let layers = CarbonVue.historyCO2.layers;
    if (layers.length>0) y -= layers[layers.length-1].amount; // TODO use height insetead
  } else if (CarbonVue.historyData.show) {
    y += CarbonVue.historyData.scrollDataComponent;
  }

  let angle = Math.atan2(y - (center.y - render.bounds.min.y), x - center.x);
  let factor = (body.label == "data" || body.label == "fall") ? 1.25 : 1.4;
  let edge = ((body.render.sprite.yScale * conf.assets.edge) / 2) * factor;
  let centerX = center.x + edge * Math.cos(angle);
  let centerY = center.y + edge * Math.sin(angle);

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(centerX, centerY - render.bounds.min.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, conf.assets.selectCircleSize, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
}

const engine = Matter.Engine.create();
engine.world.gravity.scale = 0; // disable Matter.js gravity
const render = Matter.Render.create({element: document.getElementById("unplug"), engine, options: conf.matterOpts.renderer});
const metaData = new Map(); // map storage for the entity metadata
let hoverChunk = {}; // storage for the entity in the "hover" state
let clickedChunk = {}; // storage for the entity in the "clicked" state

generateWalls();

// Main animation loop
const mainLoop = new Loop({
  update: (delta, elapsedt, lastDelta) => {
    const bodies = Matter.Composite.allBodies(engine.world);
    // the label of each bodies tell us which gravity rule to use
    bodies.forEach(body => {
      if (body.label == "wall") return; // walls dosen't moves !
      let forceX = 0;
      let forceY = 0;
      if (body.label == "fall") { // falling object: apply classic gravity
        forceY = body.mass * conf.gravity;
      } else if (body.label == "evaporate") { //evaporating object: reverse gravity
        forceY = -body.mass * conf.gravity;
      } else { // co2 or data object: attract it to the center
        forceX = body.mass * (render.options.width / 2 - body.position.x) * conf.attractor;
        forceY = body.mass * (render.options.height / 2 - body.position.y) * conf.attractor;
      }
      if (body !== clickedChunk.body) {
        Matter.Body.applyForce(body, body.position, {x: forceX, y: forceY});
      }
    });
    const correction = (lastDelta == 0) ? 1 : delta / lastDelta;
    Matter.Engine.update(engine, delta, correction);
  },
  draw: (delta) => {
    Matter.Render.world(render);
    if (clickedChunk.body) {
      drawSelectionLine(clickedChunk.body, render.context);
    }
    // render custom UI elements (see conf.mjs)
    for (const ele of conf.uiElements) {
      if (ele.pos.y >= render.bounds.min.y && ele.pos.y <= render.bounds.max.y) {
        render.context.translate(ele.pos.x, ele.pos.y - render.bounds.min.y);
        render.context.fillStyle = ele.color;
        render.context.scale(ele.scale, ele.scale);
        render.context.fill(conf.icons[ele.icon]);
        render.context.setTransform(1, 0, 0, 1, 0, 0);
      }
    }
  }
});

mainLoop.start();

// Stop the animation loop when the document is hidden (and restart it when it's not)
document.onvisibilitychange = () => {
  if (document.hidden && mainLoop.isRunning()) {
    mainLoop.stop();
  } else if (!document.hidden && !mainLoop.isRunning()) {
    mainLoop.start();
  }
};

const chunkifyData = (input) => {
  let size = input.contentLength; // data size in [byte]
  let spawnChunks = 0;
  const constMetaData = {
    initiator: input.initiator,
    contentLength: input.contentLength,
    chunkSizeCo2: 0,
    co2: input.co2,
    energyNRE: input.energyNRE,
    energyRE: input.energyRE,
    extraInfo: input.extraInfo
  };
  for (let i=0; i<conf.chunks.data.length; i++) {
    let chunkSize = conf.chunks.data[i];
    let edge = conf.chunks.edge[i];
    let nchunks = Math.floor(size / chunkSize);
    size %= chunkSize;
    for (let j = 0; j < nchunks; j++) {
      if (metaData.size >= conf.chunks.maxTotal) return;
      let entity = generateData(edge);
      metaData.set(entity, {...constMetaData, chunkSizeData: chunkSize});
      spawnChunks++;
      if (spawnChunks >= conf.chunks.maxBySpawn) return;
    }
  }
  if (input.contentLength <= size) {
    let entity = generateData(2);
    metaData.set(entity, {...constMetaData, chunkSizeData: input.contentLength});
  }
}

const chunkifyCo2 = (input) => {
  let co2 = input.co2 * 1000000; // co2 emission in [kg]
  let spawnChunks = 0;
  const constMetaData = {
    initiator: input.initiator,
    contentLength: input.contentLength,
    chunkSizeData: 0,
    co2: input.co2,
    energyNRE: input.energyNRE,
    energyRE: input.energyRE,
    extraInfo: input.extraInfo
  };
  for (let i=0; i<conf.chunks.co2.length; i++) {
    let chunkSize = conf.chunks.co2[i];
    let radius = conf.chunks.radius[i];
    let nchunks = Math.floor(co2 / chunkSize);
    co2 %= chunkSize;
    for (let j = 0; j < nchunks; j++) {
      if (metaData.size >= conf.chunks.maxTotal) return;
      let entity = generateCO2(radius);
      metaData.set(entity, {...constMetaData, chunkSizeCo2: chunkSize / 1000000});
      spawnChunks++;
      if (spawnChunks >= conf.chunks.maxBySpawn) return;
    }
  }
  if (input.co2 * 1000000 <= co2) {
    let entity = generateCO2(1);
    metaData.set(entity, {...constMetaData, chunkSizeCo2: input.co2});
  }
}

pubSub.subscribe('input-data', input => {
  chunkifyData(input);
  chunkifyCo2(input);
});

pubSub.subscribe('clear-selection', () => {
  if (clickedChunk.texture) { // if something is selected
    clickedChunk.body.render.sprite.texture = clickedChunk.texture;
    clickedChunk.body.collisionFilter.mask = clickedChunk.mask;
    clickedChunk.body.render.zIndex = 50;
    clickedChunk = {};
  }
});

// DATA simulator
if (DATA && DATA.length > 0) {
  let startTime = DATA[0].timeStamp;
  for (const input of DATA) {
    if (input.fromCache) continue; // skip data loaded from cache
    if (input.contentLength < 1) continue; // skip data less than 1 byte
    mainLoop.setTimeout(
      Math.round(input.timeStamp - startTime),
      () => pubSub.publish('input-data', input)
    );
  }
}

// computer CO2 default usage
mainLoop.setInterval(1000, () => {
  // const co2 =  0.023651219231638508 * 10000000 / 3600;
  // const energgyNREHomeDefaultPerHour = 0.5285774234423879;
  // const energyREHomeDefaultPerHour = 0.12011280706531807;
  // doesnt need to calculate, it's a constant value: ~6.57 [mg/sec]
  let co2 = generateCO2(6);
  metaData.set(co2, {
    initiator: 'computer',
    contentLength: 0,
    chunkSizeData: 0,
    chunkSizeCo2: 6.57e-6,
    co2: 6.57e-6,
    energyNRE: 1.47e-4,
    energyRE: 3.34e-5,
    extraInfo: { timeStamp: new Date() }
  });
  CarbonVue.co2DataCounter.co2 += 6.57e-3;
});

// Mouse management
const mouse = Matter.Mouse.create(render.canvas);
const mouseConstraint = Matter.MouseConstraint.create(engine, {
  mouse, constraint: {stiffness: 0, render: {visible: false}}
});
Matter.World.add(engine.world, mouseConstraint);
mouseConstraint.mouse.element.removeEventListener("mousewheel", mouseConstraint.mouse.mousewheel);
mouseConstraint.mouse.element.removeEventListener("DOMMouseScroll", mouseConstraint.mouse.mousewheel);
render.mouse = mouse; // keep the mouse in sync with rendering

// Manage click on UI element and trigger the coresponding action
Matter.Events.on(mouseConstraint, "mouseup", event => {
  let mousePos = event.mouse.mousedownPosition;
  mousePos = mouse.absolute;
  // Collision test with UI elements
  for (const ele of conf.uiElements) {
    if (ele.pos.y >= render.bounds.min.y && ele.pos.y <= render.bounds.max.y) {
      render.context.translate(ele.pos.x, ele.pos.y - render.bounds.min.y);
      render.context.scale(ele.scale, ele.scale);
      if (render.context.isPointInPath(conf.icons[ele.icon], mousePos.x, mousePos.y)) {
        uiActions[ele.action](); //execute the action linked to this UI ele
        render.context.setTransform(1, 0, 0, 1, 0, 0);
        break;
      }
      render.context.setTransform(1, 0, 0, 1, 0, 0);
    }
  }
});

Matter.Events.on(mouseConstraint, "mousemove", event => {
  // Reset hover state
  if (hoverChunk.body && (clickedChunk.body != hoverChunk.body)) {
    hoverChunk.body.render.sprite.texture = hoverChunk.texture;
    hoverChunk = {};
  }
  // Find the body in collision with the mouse position
  const bodies = Matter.Composite.allBodies(engine.world);
  const foundBodies = Matter.Query.point(bodies, event.mouse.position);
  if (foundBodies.length < 1) return;
  let body = foundBodies[0];
  if (!metaData.has(body) || body == clickedChunk.body) return;
  // Change the asset of the body
  const asset = body.label == "data" || body.label == "fall" ? conf.assets.dataHover : conf.assets.co2Hover;
  hoverChunk = {body, texture: body.render.sprite.texture};
  body.render.sprite.texture = asset;
});

// Manage click on Data or Co2 entity (for the metadata popup)
Matter.Events.on(mouseConstraint, "mousedown", event => {
  // Reset clicked state
  if (clickedChunk.texture) {
    pubSub.publish('clear-selection', null);
  }
  // Find the body in collision with the mouse position
  const bodies = Matter.Composite.allBodies(engine.world);
  const foundBodies = Matter.Query.point(bodies, event.mouse.position);
  if (foundBodies.length < 1) return;
  let body = foundBodies[0];
  if (!metaData.has(body)) return;
  // Change the asset of the body
  const isData = body.label == "data" || body.label == "fall";
  const asset = isData ? conf.assets.dataActive : conf.assets.co2Active;
  const texture = hoverChunk.body == body ? hoverChunk.texture : body.render.sprite.texture;
  const mask = body.collisionFilter.mask;
  clickedChunk = {body, texture, mask};
  body.render.sprite.texture = asset;
  // Put the selected entity to the front (z-index), and remove it from collision
  body.collisionFilter.mask = conf.categories.nothing;
  body.render.zIndex = 100;
  pubSub.publish(isData ? 'selected-data' : 'selected-co2', metaData.get(body));
});

export { engine, render, mouseConstraint, metaData };