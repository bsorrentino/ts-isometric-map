import { Entity, MapPosition, ScreenPosition, TileMap } from './iso'

export class Tile implements Entity { 

    constructor( public screenPos:ScreenPosition, private mapPos:MapPosition, private map:TileMap) {
        console.log( `screen: [${this.screenPos.x},${this.screenPos.y}} - map:[${this.mapPos.x},${this.mapPos.y}]`)
    }

    render():void {
        const  { x, y } = this.screenPos // topRight
        const  { x: x0, y: y0 } = this.map.getTilePos(this.screenPos) // bottomLeft
        
        const { context, tile: {width, height, color } } = this.map

        const cx = x - width / 2
        const cy = y + height / 2

        // begin
        context.beginPath()

        // move to start point
        context.moveTo(cx, y)

        /**
         * create four lines
         * --------------------------------------------
         *    step 1  |  step 2  |  step 3  |  step 4
         * --------------------------------------------
         *    /       |  /       |  /       |  /\  
         *            |  \       |  \/      |  \/
         * --------------------------------------------
         */
        context.lineTo(x0, cy)
        context.lineTo(cx, y0)
        context.lineTo(x, cy)
        context.lineTo(cx, y)

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