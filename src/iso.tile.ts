import { Entity, MapPosition, ScreenPosition, TileMap } from './iso'

export class Tile implements Entity { 

    highlight = false

    constructor( public screenPos:ScreenPosition, private mapPos:MapPosition, private map:TileMap) {
        console.log( `screen: [${this.screenPos.x},${this.screenPos.y}} - map:[${this.mapPos.x},${this.mapPos.y}]`)
    }

    render():void {

        const v = this.map.getTileVertex(this.screenPos)

        const  { x, y } = this.screenPos // topRight
        
        const { context, tile: { color } } = this.map

        // begin
        context.beginPath()

        /**
         * create four lines
         * --------------------------------------------
         *    step 1  |  step 2  |  step 3  |  step 4
         * --------------------------------------------
         *    /       |  /       |  /       |  /\  
         *            |  \       |  \/      |  \/
         * --------------------------------------------
         */

        // move to start point
        context.moveTo(v.top.x, v.top.y)
        // define lines
        context.lineTo(v.left.x, v.left.y)
        context.lineTo(v.bottom.x, v.bottom.y)
        context.lineTo(v.right.x, v.right.y)
        context.lineTo(v.top.x, v.top.y)

        if( this.highlight ) {
            context.strokeStyle = '#ffff00'
        }
        // draw path
        context.stroke()
        // fill tile
        context.fillStyle = color
        context.fill() 
    
        // Debug

        // context.beginPath()
        // context.rect( x0, y, width, height)
        // context.stroke()

        context.fillStyle = 'black'
        context.fillText( `${this.mapPos.x},${this.mapPos.y}`, x - 40, y + 20 )

    }
}