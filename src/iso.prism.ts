import { BaseEntity, Entity, ScreenPosition, TileMap } from './iso'

/**
 * 
 */
export class Prism extends BaseEntity {

    /**
     * 
     * @param x - map x position
     * @param y - map y position
     * @param map 
     */
    constructor( screenPos:ScreenPosition, private map:TileMap) {
        super( screenPos )
    }

    compare( e:Prism ):number {
        
        const dy = this.screenPos.y - e.screenPos.y 
        if( dy === 0 ) {
            return this.screenPos.x - e.screenPos.x
        }
        return dy
    }

    render() {
        const {x,y} = this.screenPos

        const { context, tile: {width, height } } = this.map

        // top
        context.beginPath()

        context.moveTo(x - width / 2, y - height)
        context.lineTo(x - width, y - height / 2)
        context.lineTo(x - width / 2, y)
        context.lineTo(x, y - height / 2)
        context.lineTo(x - width / 2,  y - height)

        context.fillStyle = '#555555'
        context.fill()

        // left
        context.beginPath()

        context.moveTo(x - width, y - height / 2)
        context.lineTo(x - width, y + height / 2)
        context.lineTo(x - width / 2, y + height)
        context.lineTo(x - width / 2, y)
        context.lineTo(x - width, y - height / 2)

        context.fillStyle = '#444444'
        context.fill()

        // right
        context.beginPath()

        context.moveTo(x - width / 2, y)
        context.lineTo(x, y - height / 2)
        context.lineTo(x, y + height / 2)
        context.lineTo(x - width / 2, y + height)
        context.lineTo(x - width / 2, y)

        context.fillStyle = '#777777'
        context.fill()            
    }
}
