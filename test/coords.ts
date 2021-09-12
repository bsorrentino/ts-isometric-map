import { MapPosition, ScreenPosition, Size } from "../src/iso"




test( 'screen to iso', () => {

    const tileSize:Size = { width: 64, height: 32 }


    function convertMapToIso( mapPos:MapPosition, screenPos:ScreenPosition ):MapPosition {
    
        const x = (screenPos.x - mapPos.x) / tileSize.width
        const y = (screenPos.y - mapPos.y) / tileSize.height
    
        return { 
            x: Math.floor(y + x), 
            y: Math.floor(y - x)  
        }
    }
    
    expect( tileSize.width ).toBe(64)
    expect( tileSize.height ).toBe(32)

})