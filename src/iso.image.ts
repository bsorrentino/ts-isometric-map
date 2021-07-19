
import { Entity, ScreenPosition, TileMap } from './iso'

export class Image implements Entity {
    source?:HTMLImageElement

    constructor(  private basename:string, public screenPos:ScreenPosition, private map:TileMap) {
        console.log( 'image', screenPos )

        this.source =  map.images.get( basename )
    }

    render():void {
        if( this.source ) {
            const { x, y } = this.map.getTilePos( this.screenPos )
            this.map.context.drawImage( this.source, x, y)    
        }
        else {
            this.source =  this.map.images.get( this.basename )
        }
    }
}