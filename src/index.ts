import { Direction, MapParameters, TileMap } from './iso'
import { Tile } from './iso.tile'
import { Prism } from './iso.prism'
import { Person } from './iso.person'
import { keyboard, mouse } from './iso.input' 
import { Image as Img } from './iso.image'

// isometric map settings
const params:MapParameters = {
    screen: { width: 1024*2, height: 800*2 },
    mapSize: { width: 14, height: 14 },
    tileSize: { width: 64, height: 32 } // height = width / 2
}

const outDiv = document.getElementById('debug')

const TILE_LAYER = 0 
const PRISM_LAYER = 1
const PERSON_LAYER = 2

// create map
const isoMap = new TileMap(params);
isoMap.loadImages( 
    'assets/man-ne.png', 
    'assets/man-nw.png', 
    'assets/man-se.png',
    'assets/man-sw.png',
    'assets/tiles/grass01.png',
    'assets/tiles/rock.png',
    'assets/tiles/snow.png',
    'assets/tiles/brickpavers2.png',
    'assets/tiles/cretebrick970.png',
    'assets/wall-low-single.png'
    ).then( start )

function start() {
    isoMap.addTiles( TILE_LAYER );
    isoMap.start()

    let left = keyboard("ArrowLeft"),
        up = keyboard("ArrowUp"),
        right = keyboard("ArrowRight"),
        down = keyboard("ArrowDown");

    // const _mouse = mouse( isoMap.canvas )
    const _mouse = mouse( document.body )

    _mouse.press =  (event) => {
            let pos = _mouse.getMousePosition(event)

            if( pos != null ) {

                pos = isoMap.convertScreenToIso(pos) // adjust position on map

                isoMap.addEntity( new Img( 'wall-low-single', isoMap.convertIsoToScreen( pos ) , isoMap), PRISM_LAYER )
           
                //isoMap.addEntity( new Prism( isoMap.convertIsoToScreen( pos ), isoMap), PRISM_LAYER )
            }
    }

    let lastTile:Tile|undefined

    _mouse.move = (event) => {
        const mousepos = _mouse.getMousePosition(event)

        if( mousepos != null ) {

            const pos = isoMap.convertScreenToIso(mousepos) // adjust position on map
        
            outDiv!.innerHTML = `[${mousepos.x},${mousepos.y}] - [${pos.x},${pos.y}]`
            const tile = isoMap.findTileByIsoPos(pos, TILE_LAYER)

            if( tile ) {
                if( lastTile ) {
                    lastTile.highlight = false
                }
                //console.log( `${tile.mapPos.x},${tile.mapPos.y}`)
                lastTile = tile 
                lastTile.highlight = true
            }
        }
    }

    // const img = new ImageEntity('man-ne', isoMap.convertIsoToScreen( {x:1, y:0} ), isoMap )
    // isoMap.addEntity( img )

    const person = new Person(  {x:1, y:1}, isoMap )

    isoMap.addEntity( person, PERSON_LAYER )

    const release = () => person.move = null

    left.press = () => person.move = Direction.SW 
    right.press = () => person.move = Direction.NE
    up.press = () => person.move = Direction.NW
    down.press = () => person.move = Direction.SE

    left.release = release
    right.release = release
    down.release = release
    up.release = release

}