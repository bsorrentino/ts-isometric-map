import { Entity, ScreenPosition, MapPosition, TileMap, BaseEntity, Direction } from './iso'

type ImageSet = 'man-se'|'man-sw'|'man-ne'|'man-nw'

export class Person extends BaseEntity {

    move:Direction|null = null
    currentImage:ImageSet = 'man-se'

    constructor( public mapPos:MapPosition, private map:TileMap) {
        super( map.convertIsoToScreen( mapPos ) )
    }

    compare( e:Person ):number {
        
        const dy = this.screenPos.y - e.screenPos.y 
        if( dy === 0 ) {
            return this.screenPos.x - e.screenPos.x
        }
        return dy
    }

    private _moveTo( dir:Direction, _mapPos:MapPosition, image:ImageSet) {
        if( this.map.isOnMap( _mapPos ) ){
            this.currentImage = image

            const _screenPos = this.map.convertIsoToScreen( _mapPos )

            if( !this.map.checkCollision( _screenPos, dir, 1 ) ) {
                this.mapPos     = _mapPos
                this.screenPos  = _screenPos
            }
        }

    }

    render():void {

        switch( this.move ) {
            case Direction.SE:
                this._moveTo( Direction.SE, { x:this.mapPos.x + 1, y:this.mapPos.y }, 'man-se')
                break
            case Direction.SW:
                this._moveTo( Direction.SW, { x:this.mapPos.x,y:this.mapPos.y+1}, 'man-sw')
                break
            case Direction.NE:
                this._moveTo( Direction.NE, { x:this.mapPos.x,y:this.mapPos.y-1 }, 'man-ne')
                break
            case Direction.NW:
                this._moveTo( Direction.NW, { x:this.mapPos.x-1,y:this.mapPos.y }, 'man-nw')
                break

        }
        this.map.renderImage(this.currentImage, this.screenPos )
        
    }
}