import { Entity, ScreenPosition, TileMap } from './iso'

export class Tile implements Entity { 

    constructor( public screenPos:ScreenPosition, private map:TileMap) {}

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
            
    }
}