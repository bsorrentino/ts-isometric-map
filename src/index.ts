import { Iso } from './isomap'

// isometric map settings
const params:Iso.MapParameters = {
    screen: { width: 1024, height: 768 },
    map: { width: 14, height: 14 },
    tile: { width: 64, height: 32 }
}

// create map
const isoMap = new Iso.Map(params);
isoMap.create();

// draw shape
isoMap.drawPrism({ x: 5, y: 6});
isoMap.drawPrism({ x: 8, y: 7});


