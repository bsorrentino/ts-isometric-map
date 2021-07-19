
import { Entity, ScreenPosition, TileMap } from './iso'

export class Image implements Entity {
    source?:HTMLImageElement

    constructor(  private basename:string, public screenPos:ScreenPosition, private map:TileMap) {}

    render():void {
        this.map.renderImage( this.basename, this.screenPos )
    }
}