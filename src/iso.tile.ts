import { Entity, MapPosition, ScreenPosition, TileMap } from './iso'

export class Tile implements Entity { 

    highlight = false

    constructor( public screenPos:ScreenPosition, public mapPos:MapPosition, private map:TileMap) {
    }

    compare( e:Tile ):number {
        return ( e.highlight ) ? -1 : 0
    }

    render():void {
        const { context } = this.map

        context.save()

        if( this.highlight ) {
            this._renderLines()
        }
        else  {
            this._renderImage()
        }

        // Debug
        if( this.highlight ) {
            this._drawTileRect()
            this._drawMapPos()
        }

        context.restore()
    }

    private _renderImage():void {
        this.map.renderImageScaled('cretebrick970', this.screenPos, this.map.tile )
    }

    private _renderLines():void {

        const v = this.map.getTileVertex(this.screenPos)
        
        const { context, tile: { color } } = this.map

        /**
         * create four lines
         * --------------------------------------------
         *    step 1  |  step 2  |  step 3  |  step 4
         * --------------------------------------------
         *    /       |  /       |  /       |  /\  
         *            |  \       |  \/      |  \/
         * --------------------------------------------
         */

        // begin
        context.beginPath()
        // move to start point
        context.moveTo(v.top.x, v.top.y)
        // define lines
        context.lineTo(v.left.x, v.left.y)
        context.lineTo(v.bottom.x, v.bottom.y)
        context.lineTo(v.right.x, v.right.y)
        context.lineTo(v.top.x, v.top.y)        
        context.strokeStyle = 'black'

        // draw path
        context.stroke()
    

        // fill tile
        context.fillStyle = (this.highlight) ? '#ffff00' : color
        context.fill() 
    
    }

    private _drawMapPos() {

        const { context } = this.map
        const { x, y } = this.screenPos // topRight

        context.fillStyle = 'black'
        context.fillText( `${this.mapPos.x},${this.mapPos.y}`, x - 40, y + 20 )

    }
    private _drawTileRect( ) {

        // Debug
        const { context, tile: { width, height } } = this.map
        const { topLeft: { x, y } } = this.map.getTileRect(this.screenPos)
        context.beginPath()
        context.rect( x, y, width, height)
        context.stroke()

    }
}