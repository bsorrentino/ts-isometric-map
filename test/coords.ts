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

    export function grid2screen( params:grid2screen_params ):ScreenPosition {
        const { tileSize, tilePos, mapSize } = params
        return { 
            x: (tileSize.width * tilePos.x)/2 + (mapSize.height * tileSize.width)/2 - (tilePos.y * tileSize.width)/2, 
            y: ((mapSize.height - tilePos.y - 1) * tileSize.height)/2 + (mapSize.width * tileSize.height)/2 - (tilePos.x * tileSize.height )/2 
        }
    }
    export function grid2screen2( params:grid2screen_params ):ScreenPosition {
        const { tileSize, tilePos, mapSize } = params
        return { 
            x: tileSize.width/2 * (tilePos.x + mapSize.height - tilePos.y), 
            y: tileSize.height/2 * ((mapSize.height - tilePos.y - 1) + mapSize.width - tilePos.x) 
        }
    }

    export function screen2grid( screen:ScreenPosition ):MapPosition {
        return { x: 0, y: 0 }
    }

}


test( 'screen to iso', () => {


    const tileSize:Size = { width: 64, height: 32 }
    const mapSize:Size =  { width: 14, height: 14 }

    function convertMapToIso( mapPos:MapPosition, screenPos:ScreenPosition ):MapPosition {
    
        const x = (screenPos.x - mapPos.x) / tileSize.width
        const y = (screenPos.y - mapPos.y) / tileSize.height
    
        return { 
            x: Math.floor(y + x), 
            y: Math.floor(y - x)  
        }
    }
    
    const params = { tilePos: { x: 1, y: 1}, tileSize: tileSize, mapSize: mapSize }
    console.log( article2.grid2screen( params ) )

    expect(article2.grid2screen(params)).toEqual(article2.grid2screen2(params))

    expect( tileSize.width ).toBe(64)
    expect( tileSize.height ).toBe(32)

})