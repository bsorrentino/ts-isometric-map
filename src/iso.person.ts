import { Entity, ScreenPosition, MapPosition, TileMap, BaseEntity } from './iso'

export class Person extends BaseEntity {

    move:'down'|'up'|'left'|'right'|'none' = 'none'
    currentImage:string = 'man-se'

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

    render():void {

        switch( this.move ) {
            case 'down':
                
                if( this.map.isOnMap( { x:this.mapPos.x+1,y:this.mapPos.y } ) ){
                    this.mapPos.x +=1 
                    this.currentImage = 'man-se'
                }
                break
            case 'left':
                if( this.map.isOnMap( { x:this.mapPos.x,y:this.mapPos.y+1} ) ){
                    this.mapPos.y +=1 
                    this.currentImage = 'man-sw'
                }
                break
            case 'right':
                if( this.map.isOnMap( { x:this.mapPos.x,y:this.mapPos.y-1 } ) ){
                    this.mapPos.y -=1 
                    this.currentImage = 'man-ne'
                }
                break
            case 'up':
                if( this.map.isOnMap( { x:this.mapPos.x-1,y:this.mapPos.y } ) ){                
                    this.mapPos.x -=1 
                    this.currentImage = 'man-nw'
                    }
                break
        }
        this.screenPos = this.map.convertIsoToScreen(this.mapPos)
        this.map.renderImage(this.currentImage, this.screenPos )
        
    }
}