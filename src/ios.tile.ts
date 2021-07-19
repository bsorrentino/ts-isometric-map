import { Entity, MapPosition, ScreenPosition, TileMap } from './iso'

export class Tile implements Entity { 

    constructor( public screenPos:ScreenPosition, private mapPos:MapPosition, private map:TileMap) {
        console.log( `screen: [${this.screenPos.x},${this.screenPos.y}} - map:[${this.mapPos.x},${this.mapPos.y}]`)
    }

    render():void {
        const  { x, y } = this.screenPos
        const { context, tile: {width, height, color } } = this.map

        // begin
        context.beginPath()

        // move to start point
        context.moveTo(x - width / 2, y)

        /**
         * create four lines
         * --------------------------------------------
         *    step 1  |  step 2  |  step 3  |  step 4
         * --------------------------------------------
         *    /       |  /       |  /       |  /\  
         *            |  \       |  \/      |  \/
         * --------------------------------------------
         */
        context.lineTo(x - width, y + height / 2)
        context.lineTo(x - width / 2, y + height)
        context.lineTo(x, y + height / 2)
        context.lineTo(x - width / 2,  y)

        // draw path
        context.stroke()


        // fill tile
        context.fillStyle = color
        context.fill() 
    
        // Debug

        context.beginPath()
        context.rect( x - width, y, width, height)
        context.stroke()

        context.fillStyle = 'black'
        context.fillText( `${this.mapPos.x},${this.mapPos.y}`, x - 40, y + 20 )

    }
}