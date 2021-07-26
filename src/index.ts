import { MapParameters, TileMap, ScreenPosition } from './iso'
import { Prism } from './iso.prism'
import { Person } from './iso.person'
import { Image as ImageEntity } from './iso.image'
import { keyboard, mouse, getMousePositionRelativeToTarget } from './iso.input' 

// isometric map settings
const params:MapParameters = {
    screen: { width: 1024, height: 800 },
    mapSize: { width: 14, height: 14 },
    tileSize: { width: 64, height: 32 }
}

// create map
const isoMap = new TileMap(params);
isoMap.create();
isoMap.loadImages( 'assets/man-ne.png', 'assets/man-nw.png', 'assets/man-se.png',' assets/man-sw.png' )


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

// const img = new ImageEntity('man-ne', isoMap.convertIsoToScreen( {x:1, y:0} ), isoMap )
// isoMap.addEntity( img )

const person = new Person(  {x:1, y:1}, isoMap )

isoMap.addEntity( person )

left.press = () => {
    person.move = 'left'
}
left.release = () => { 
    person.move = 'none'
}

right.press = () => {
    person.move = 'right'
}
right.release = () => { 
    person.move = 'none'
}

up.press = () => {
    person.move = 'up'
}
up.release = () => { 
    person.move = 'none'
}


down.press = () => { 
    person.move = 'down'
}
down.release = () => { 
    person.move = 'none'
}
