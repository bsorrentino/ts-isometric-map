import { MapParameters, TileMap, ScreenPosition } from './iso'
import { Prism } from './iso.prism'
import { Image as ImageEntity } from './iso.image'
import { keyboard, mouse, getMousePositionRelativeToTarget } from './iso.input' 

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


let left = keyboard("ArrowLeft"),
      up = keyboard("ArrowUp"),
      right = keyboard("ArrowRight"),
      down = keyboard("ArrowDown");

const _mouse = mouse()

_mouse.press =  (event) => {
        let pos = getMousePositionRelativeToTarget(event)

        if( pos != null ) {
            pos = isoMap.convertScreenToIso(pos) // adjust position on map
                
            isoMap.addEntity( new Prism( isoMap.convertIsoToScreen( pos ), isoMap) )
        }
}

const img = new ImageEntity('man-ne', isoMap.convertIsoToScreen( {x:1, y:0} ), isoMap )

const success = isoMap.addEntity( img )

console.log( 'add image ', success )

left.press = () => console.log( 'left press' )
right.press = () => console.log( 'right press' )
up.press = () => console.log( 'up press' )
down.press = () => console.log( 'down press' )
