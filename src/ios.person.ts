import { Entity, ScreenPosition, MapPosition, TileMap } from './iso'

export class Person implements Entity {

    move:'down'|'up'|'left'|'right'|'none' = 'none'
    currentImage:string = 'man-se'
    screenPos:ScreenPosition

    constructor( public mapPos:MapPosition, private map:TileMap) {
        this.screenPos = map.convertIsoToScreen( mapPos )
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