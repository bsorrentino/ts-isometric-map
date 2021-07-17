import { Iso } from './isomap'


/**
 * 
 * @param event 
 * @returns 
 */
    function getMousePosition(event:MouseEvent):Iso.MapPosition|null {
    const canvas = event.target as HTMLCanvasElement|null;

    if( canvas == null ) return null

    const rect = canvas.getBoundingClientRect()

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }
}

// isometric map settings
const params:Iso.MapParameters = {
    screen: { width: 1024, height: 768 },
    mapSize: { width: 14, height: 14 },
    tileSize: { width: 64, height: 32 }
}

// create map
const isoMap = new Iso.TileMap(params);
isoMap.create();
isoMap.loadImage( '/assets/man-ne.png' )

isoMap.canvas.addEventListener('mousedown', (event) => {
        const mousePosition = getMousePosition(event)

        if( mousePosition != null ) {
            
            isoMap.addPrism(mousePosition);
            // isoMap.addImage( 'man-ne', mousePosition )
        }

}, false);


