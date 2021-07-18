import { MapParameters, TileMap, ScreenPosition } from './iso'
import { Prism } from './iso.prism'
import { Image as ImageEntity } from './iso.image'

/**
 * 
 * @param event 
 * @returns 
 */
    function getMousePosition(event:MouseEvent):ScreenPosition|null {
    const canvas = event.target as HTMLCanvasElement|null;

    if( canvas == null ) return null

    const rect = canvas.getBoundingClientRect()

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }
}

// isometric map settings
const params:MapParameters = {
    screen: { width: 1024, height: 768 },
    mapSize: { width: 14, height: 14 },
    tileSize: { width: 64, height: 32 }
}

// create map
const isoMap = new TileMap(params);
isoMap.create();
isoMap.loadImages( '/assets/man-ne.png', '/assets/man-nw.png', '/assets/man-se.png',' /assets/man-sw.png' )

isoMap.canvas.addEventListener('mousedown', (event) => {
        const mousePosition = getMousePosition(event)

        if( mousePosition != null ) {
            
            isoMap.addEntity( new Prism( mousePosition, isoMap) )
 
        }
}, false);

const success = isoMap.addEntity(  new ImageEntity('man-ne', isoMap.convertIsoToScreen( {x:0, y:0} ), isoMap ) )

console.log( 'add image ', success )

