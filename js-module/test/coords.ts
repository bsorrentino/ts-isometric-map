import { MapPosition, Position, ScreenPosition, Size } from "../src/iso"


const halfSize = ( size:Size ):Size => ({ width: size.width/2 , height: size.height/2 })
const addPosition = ( p1:Position, p2:Position ):Position => ({ x: p1.x + p2.x , y: p1.y + p2.y })

//
// @see https://cownado.com/posts/2015/03/how-do-isometric-coordinates-work.html
//
namespace article1 {

    export function grid2screen( grid:MapPosition ):ScreenPosition {
        return { x: grid.x - grid.y, y: (grid.x + grid.y) / 2 }
    }

    export function screen2grid( screen:ScreenPosition ):MapPosition {
        const half_screen_x = screen.x / 2
        return { x: screen.y + half_screen_x, y: screen.y - half_screen_x }
    }

}

//
// @see https://isometric-tiles.readthedocs.io/en/latest/
//
namespace article2 {

    export type Params = {
        tileSize: Size   // width of each tile in pixel, height of each tile in pixels
        tilePos: Position       // x-coordinate of the tile, in tiles, y-coordinate of the tile, in tiles
        mapSize: Size       // width of the map, in tiles, height of the map, in tiles
    } 

    export function map2screen_v1( params:Params ):ScreenPosition {
        const { tileSize, tilePos, mapSize } = params
        return { 
            x: (tileSize.width * tilePos.x)/2 + (mapSize.height * tileSize.width)/2 - (tilePos.y * tileSize.width)/2, 
            y: ((mapSize.height - tilePos.y - 1) * tileSize.height)/2 + (mapSize.width * tileSize.height)/2 - (tilePos.x * tileSize.height )/2 
        }
    }
    export function map2screen( params:Omit<Params, 'tileSize'> & { halfTileSize:Size } ):ScreenPosition {
        const { halfTileSize, tilePos, mapSize } = params
        return { 
            x: halfTileSize.width * (tilePos.x + mapSize.height - tilePos.y), 
            y: halfTileSize.height * ((mapSize.height - tilePos.y - 1) + mapSize.width - tilePos.x) 
        }
    }

}

//
// @see http://clintbellanger.net/articles/isometric_math/
//
namespace article3 {
    export type Params = {
        tileSize:Size
        halfTileSize: Size      // width of each tile in pixel, height of each tile in pixels
        pos: Position           // x-coordinate of the tile, in tiles, y-coordinate of the tile, in tiles
        mapPos:Position         // position of the Map on the screen
    } 

   /**
    * convert grid to screen assuming grid origin is {x:0, y:0} 
    * 
    * @param params 
    * @returns 
    */ 
   export function map2screen_V1( params:Params ):ScreenPosition {
        const { halfTileSize, pos: tilePos } = params
        return { 
            x: halfTileSize.width * ( tilePos.x - tilePos.y ) , 
            y: halfTileSize.height  * ( tilePos.x + tilePos.y )
        }
    }

    /**
     * convert grid to screen considering dynamic grid origin
     * 
     * @param params 
     * @returns 
     */
    export function map2screen( params:Params ):ScreenPosition {
        const { halfTileSize, pos: tilePos, mapPos } = params
        return { 
            x: (halfTileSize.width * ( tilePos.x - tilePos.y )) + mapPos.x, 
            y: (halfTileSize.height  * ( tilePos.x + tilePos.y )) + mapPos.y
        }
    }

    /**
     * implements inversion formula of 'map2screen'
     * 
     * @param params 
     * @returns 
     */
    export function screen2map_V1( params:Params ):MapPosition {
        const { halfTileSize, pos: screenPos, mapPos } = params

        const x = ((screenPos.x - mapPos.x)/(halfTileSize.width))/2
        const y = ((screenPos.y - mapPos.y)/(halfTileSize.height))/2 
        
        return { 
            x: x + y, 
            y: y - x
        }
    }

    /**
     * equivalent to screen2map_V1 but more efficient (less operation)
     * @param params 
     * @returns 
     */
    export function screen2map( params:Params ):MapPosition {
        const { tileSize, pos: screenPos, mapPos } = params

        const x = ((screenPos.x - mapPos.x)/(tileSize.width)) 
        const y = ((screenPos.y - mapPos.y)/(tileSize.height)) 
        
        return { 
            x: x + y, 
            y: y - x
        }
    }
  
}


describe( 'grid to screen coordinates transformation', () => {

    const tileSize:Size     = { width: 64, height: 32 }
    const mapSize:Size      = { width: 14, height: 14 }
    const mapPos:Position   = { x: 0, y:0 }
    const halfTileSize      = halfSize(tileSize)

    test( 'article 2', () => {
        
        const params = { 
            tilePos: { x: 1, y: 1}, 
            tileSize: tileSize, 
            mapSize: mapSize, 
            halfTileSize:halfTileSize 
        }

        const pos = article2.map2screen(params)

        expect(pos).toEqual( { x:448, y: 400 })
        expect(article2.map2screen_v1(params)).toEqual( pos )
    
        params.tilePos = { x: 0, y: 1 } 
        console.log( article2.map2screen(params) ) 
        params.tilePos = { x: 1, y: 0 } 
        console.log( article2.map2screen(params) ) 
    
    })

    test( 'article 3', () => {
        
        const params = { 
            tileSize:tileSize,
            pos: { x: 1, y: 1}, 
            halfTileSize: halfTileSize, 
            mapPos:{ x: 10, y: 1 } 
        }
        
        expect( params.halfTileSize.width ).toBe(32)
        expect( params.halfTileSize.height ).toBe(16)

        {
            const screenPos_V1 = article3.map2screen_V1(params)
            params.mapPos = { x: 0, y: 0 } 
            const screenPos = article3.map2screen(params)
            expect(screenPos).toEqual( { x:0, y: 32 })
            expect(screenPos).toEqual(screenPos_V1)
    
        }
            
        params.mapPos = { x: 10, y: 1 } 

        for( let x = 0 ; x < 14 ; ++x) {
            for( let y = 0 ; y < 14 ; ++y) {     
                const mapPos = { x: x, y: y }
                params.pos = mapPos
                const screenPos =  article3.map2screen(params)
                // console.log( params.pos, screenPos)
                params.pos = screenPos
                expect(article3.screen2map(params)).toEqual(mapPos)     
                } 
        }
      
        for( let x = 0 ; x < 10 ; ++x) {
            for( let y = 0 ; y < 10 ; ++y) {     
                params.pos = { x:x, y:y }
                const mapPos       = article3.screen2map(params)
                const mapPos_V1    = article3.screen2map_V1(params)
                // console.log( 'check', mapPos, gridPos, gridPos_V1 )
                expect(mapPos).toEqual(mapPos_V1)  
            } 
        }
      })
})