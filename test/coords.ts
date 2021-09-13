import { MapPosition, Position, ScreenPosition, Size } from "../src/iso"

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

    export type grid2screen_params = {
        tileSize: Size   // width of each tile in pixel, height of each tile in pixels
        tilePos: Position       // x-coordinate of the tile, in tiles, y-coordinate of the tile, in tiles
        mapSize: Size       // width of the map, in tiles, height of the map, in tiles
    } 

    export function grid2screen_v1( params:grid2screen_params ):ScreenPosition {
        const { tileSize, tilePos, mapSize } = params
        return { 
            x: (tileSize.width * tilePos.x)/2 + (mapSize.height * tileSize.width)/2 - (tilePos.y * tileSize.width)/2, 
            y: ((mapSize.height - tilePos.y - 1) * tileSize.height)/2 + (mapSize.width * tileSize.height)/2 - (tilePos.x * tileSize.height )/2 
        }
    }
    export function grid2screen( params:Omit<grid2screen_params, 'tileSize'> & { halfTileSize:Size } ):ScreenPosition {
        const { halfTileSize, tilePos, mapSize } = params
        return { 
            x: halfTileSize.width * (tilePos.x + mapSize.height - tilePos.y), 
            y: halfTileSize.height * ((mapSize.height - tilePos.y - 1) + mapSize.width - tilePos.x) 
        }
    }

    export function screen2grid( screen:ScreenPosition ):MapPosition {
        return { x: 0, y: 0 }
    }

}

//
// @see http://clintbellanger.net/articles/isometric_math/
//
namespace article3 {
    export type grid2screen_params = {
        halfTileSize: Size   // width of each tile in pixel, height of each tile in pixels
        tilePos: Position       // x-coordinate of the tile, in tiles, y-coordinate of the tile, in tiles
        mapSize: Size       // width of the map, in tiles, height of the map, in tiles
    } 

    
   export function grid2screen_V1( params:grid2screen_params ):ScreenPosition {
        const { halfTileSize, tilePos } = params
        return { 
            x: halfTileSize.width * ( tilePos.x - tilePos.y ) , 
            y: halfTileSize.height  * ( tilePos.x + tilePos.y )
        }
    }
    export function grid2screen( params:grid2screen_params & { offset:Position } ):ScreenPosition {
        const { halfTileSize, tilePos, mapSize, offset } = params
        return { 
            x: halfTileSize.width  * ( offset.x + (tilePos.x - tilePos.y) ), 
            y: halfTileSize.height * ( offset.y - (tilePos.x + tilePos.y))
        }
    }
  
}

const halfSize = ( size:Size ):Size => ({ width: size.width/2 , height: size.height/2 })
    


describe( 'grid to screen coordinates transformation', () => {

    const tileSize:Size = { width: 64, height: 32 }
    const mapSize:Size =  { width: 14, height: 14 }
    const halfTileSize = halfSize(tileSize)

    test( 'article 2', () => {
        
        const params = { tilePos: { x: 1, y: 1}, tileSize: tileSize, mapSize: mapSize, halfTileSize:halfTileSize }

        const pos = article2.grid2screen(params)

        expect(pos).toEqual( { x:448, y: 400 })
        expect(article2.grid2screen_v1(params)).toEqual( pos )
    
        params.tilePos = { x: 0, y: 1 } 
        console.log( article2.grid2screen(params) ) 
        params.tilePos = { x: 1, y: 0 } 
        console.log( article2.grid2screen(params) ) 
    
    })

    test( 'article 3', () => {
        
        const params = { 
            tilePos: { x: 1, y: 1}, 
            halfTileSize: halfTileSize, 
            mapSize:mapSize, 
            offset:{ x: mapSize.height, y: mapSize.height + mapSize.width - 1} 
        }
        
        expect( params.halfTileSize.width ).toBe(32)
        expect( params.halfTileSize.height ).toBe(16)

        const pos = article3.grid2screen_V1(params)
        expect(pos).toEqual( { x:0, y: 32 })
    
        params
        params.tilePos = { x: 0, y: 1 } 
        console.log( article3.grid2screen(params) ) 
        params.tilePos = { x: 1, y: 0 } 
        console.log( article3.grid2screen(params) ) 
    })
})
