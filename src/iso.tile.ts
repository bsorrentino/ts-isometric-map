import { Entity, MapPosition, ScreenPosition, TileMap } from './iso'

export class Tile implements Entity { 

    highlight = false

    constructor( public screenPos:ScreenPosition, public mapPos:MapPosition, private map:TileMap) {
        console.log( `screen: [${this.screenPos.x},${this.screenPos.y}} - map:[${this.mapPos.x},${this.mapPos.y}]`)
    }

    render():void {

        const v = this.map.getTileVertex(this.screenPos)

        const  { x, y } = this.screenPos // topRight
        
        const { context, tile: { color } } = this.map

        context.save()


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
    
        // Debug
        if( this.mapPos.x === 13 && this.mapPos.y === 13 )
            this._drawTileRect()
        this._drawMapPos()

        context.restore()
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