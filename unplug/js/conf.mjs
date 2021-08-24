let conf = {
  width: 500, // width of the canvas and ctx in [px]
  height: 600, // height of the canvas and ctx in [px]
  rightPadding: 121,
  pageHeight: 600, // height for the tree pages of the animation
  color: {
    bg: "#fff",
  },
  assets: {
    data : 'assets/data.png',
    dataActive: 'assets/dataActive.png',
    dataHover: 'assets/dataHover.png',
    edge: 49, // Data asset edge size
    co2 : 'assets/co2.png',
    co2Active: 'assets/co2Active.png',
    co2Hover: 'assets/co2Hover.png',
    radius: 34,  // CO2 asset path and radius in px
    selectLine: "black",
    selectCircle: "white",
    selectCircleSize: 3,
  },
  spawnVariation: 10, // spawn variation in [px] from the center
  timers: {
    bgDeleteAfter: 5000,  // timer in [ms] for deleteing a background created entity
    drop: 6000,  // timer in [ms] for the gravity to take effect on an entity
    minLifetime: 35000, // minimal lifetime in [ms] of an entity
    maxLifetime: 85000, // maximal lifetime in [ms] of an entity
    variation: { // variation in [ms] for timers
      drop: 1000,
      lifetime: 5000
    }
  },
  chunks: {
    co2   : [500    , 300    , 100    , 50    , 10    , 5    , 1    , 0.5 , 0.3 , 0.1 ],  // CO2 chunk in [mg]
    data  : [5000000, 3000000, 1000000, 500000, 100000, 50000, 10000, 5000, 3000, 1000],  // Data chunk in bytes
    radius: [20     , 18     , 17     , 13.12    , 10    , 7    , 4    , 3   , 2   , 1   ],  // Chunk radius in pixels
    edge  : [40     , 36     , 33     , 30    , 20    , 14   , 8    , 6   , 4   , 2   ], // Chunk edge in pixels
    maxBySpawn: 6, // max nb of chunks for an entry
    maxTotal: 3000 // max nb of chunks allowed in all the animation
  },
  gravity: 0.00004, // gravity for falling or evaporating entities
  attractor: 0.000001, // gravity of the central attractor
  rotation: Math.PI / 3000, // speed of rotation in [radian / ms]
  icons: {
    arrowUp: new Path2D("M14.1661 1.46926C14.278 1.58008 14.751 1.99407 15.1437 2.38298C17.6033 4.65159 21.6252 10.5751 22.8561 13.6737C23.0524 14.1442 23.4704 15.3339 23.5 15.9716C23.5 16.5801 23.3585 17.1613 23.0799 17.7154C22.6893 18.4075 22.0728 18.9595 21.3465 19.2648C20.844 19.4592 19.3345 19.7645 19.3071 19.7645C17.6582 20.0677 14.9769 20.2328 12.0127 20.2328C9.19203 20.2328 6.62053 20.0677 4.94419 19.8189C4.91463 19.7917 3.04195 19.4864 2.40013 19.154C1.22627 18.5455 0.5 17.3558 0.5 16.0824V15.9716C0.527447 15.1415 1.25583 13.3978 1.28116 13.3978C2.51203 10.4642 6.33973 4.68086 8.88379 2.35579C8.88379 2.35579 9.53828 1.69926 9.94575 1.4149C10.5327 0.97163 11.259 0.749996 11.9852 0.749996C12.7959 0.749996 13.5497 0.998812 14.1661 1.46926Z"),
    arrowDown: new Path2D("M9.83385 19.5307C9.72196 19.4199 9.24904 19.0059 8.85634 18.617C6.39673 16.3484 2.37479 10.4249 1.14393 7.32625C0.947586 6.8558 0.529558 5.66609 0.5 5.02837C0.5 4.41992 0.641454 3.83866 0.92014 3.28457C1.31072 2.59249 1.92721 2.0405 2.65348 1.73523C3.15596 1.54078 4.6655 1.23551 4.69295 1.23551C6.34184 0.932331 9.02313 0.767151 11.9873 0.767151C14.808 0.767151 17.3795 0.932331 19.0558 1.18115C19.0854 1.20833 20.958 1.5136 21.5999 1.84605C22.7737 2.45449 23.5 3.64421 23.5 4.91756V5.02837C23.4726 5.85845 22.7442 7.60225 22.7188 7.60225C21.488 10.5358 17.6603 16.3191 15.1162 18.6442C15.1162 18.6442 14.4617 19.3007 14.0542 19.5851C13.4673 20.0284 12.741 20.25 12.0148 20.25C11.2041 20.25 10.4503 20.0012 9.83385 19.5307Z")
  },
  uiElements: [
    {
      icon: "arrowUp",
      pos: {x: 30, y: 270},
      scale: 0.7,
      color: "#81817F",
      action: "goUp"
    }, {
      icon: "arrowDown",
      pos: {x: 30, y: 330},
      scale: 0.7,
      color: "#81817F",
      action: "goDown"
    }, {
      icon: "arrowDown",
      pos: {x: 30, y: -270},
      scale: 0.7,
      color: "#81817F",
      action: "goDown"
    }, {
      icon: "arrowUp",
      pos: {x: 30, y: 870},
      scale: 0.7,
      color: "#81817F",
      action: "goUp"
    }
  ]
};

// some internal configuration for matter.js
conf.categories = {
  default: 0x0001,
  co2: 0x0002,
  data: 0x0004,
  meta: 0x0008,
  nothing: 0x0010,
};
conf.matterOpts =  {
  data: {
    render: {sprite: {texture: conf.assets.data}},
    label: 'data',
    collisionFilter: {category: conf.categories.data}
  },
  co2: {
    render: {sprite: {texture: conf.assets.co2}},
    label: 'co2',
    collisionFilter: {category: conf.categories.co2}
  },
  renderer: {
    width: conf.width,
    height: conf.height,
    hasBounds: true,
    wireframes: false,
    background: conf.color.bg,
  }
}

export default conf;