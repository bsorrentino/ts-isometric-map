
import { Entity, ScreenPosition, TileMap } from './iso'

export class Image implements Entity {
    source?:HTMLImageElement

    constructor(  private basename:string, public screenPos:ScreenPosition, private map:TileMap) {
        console.log( 'image', screenPos )

        this.source =  map.images.get( basename )
    }

    private get _adjustedScreenPos():ScreenPosition {

        return {
            x: this.screenPos.x - this.map.tile.width,
            y: this.screenPos.y - (this.map.tile.height *2)    
        }
    }

    render():void {
        if( this.source ) {
            const { x, y } = this._adjustedScreenPos
            this.map.context.drawImage( this.source, x, y)    
        }
        else {
            this.source =  this.map.images.get( this.basename )
        }
    }
}