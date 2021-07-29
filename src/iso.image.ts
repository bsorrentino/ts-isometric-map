
import { BaseEntity, Entity, ScreenPosition, TileMap } from './iso'

export class Image extends BaseEntity {
    source?:HTMLImageElement

    constructor(  private basename:string, screenPos:ScreenPosition, private map:TileMap) {
        super(screenPos)
    }

    render():void {
        this.map.renderImage( this.basename, this.screenPos )
    }


}