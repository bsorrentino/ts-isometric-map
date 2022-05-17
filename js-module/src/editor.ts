import { MapParameters, TileMap } from './iso'
import { Tile } from './iso.tile'
import { mouse } from './iso.input' 
import { Image as Img } from './iso.image'

// isometric map settings
const params:MapParameters = {
    screen: { width: 1024, height: 800 },
    mapSize: { width: 14, height: 14 },
    tileSize: { width: 64, height: 32 }
}

const outDiv = document.getElementById('debug')

const TILE_LAYER = 1

// create map
const isoMap = new TileMap(params);

isoMap.loadImages( 
    'assets/wall-tall.png',
    'assets/wall-low.png',
    'assets/wall-low-nw.png',
    'assets/tiles/cretebrick970.png',
    ).then( () => start() )

const IMG =  'wall-low-nw'   
/**
 * 
 */
function start() {
    isoMap.addTiles( TILE_LAYER );

    isoMap.start()

    let img:Img|undefined

    // const _mouse = mouse( isoMap.canvas )
    const _mouse = mouse( document.body )

    _mouse.press =  (event) => { 

        let pos = _mouse.getMousePosition(event)

        if( pos != null && !img) {

            pos = isoMap.convertScreenToMap(pos) // adjust position on map
            
            img = new Img( IMG, isoMap.convertMapToScreen( pos ), isoMap)

            isoMap.addEntity( img, 0 )
        }

    }

    let lastTile:Tile|undefined

    _mouse.move = (event) => {
        
        const mousepos = _mouse.getMousePosition(event)

        if( mousepos != null && img ) {

            const pos = isoMap.convertScreenToMap(mousepos) // adjust position on map
        
            outDiv!.innerHTML = `[${mousepos.x},${mousepos.y}] - [${pos.x},${pos.y}]`

            img.screenPos = mousepos
        }
    }

}