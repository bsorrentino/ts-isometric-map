import { ScreenPosition } from "./iso";

export type KeyBoardValue = 'ArrowLeft'|'ArrowUp'|'ArrowRight'|'ArrowDown'


class Key {
    isDown = false;
    isUp = true;
    press?:() => void
    release?: () => void
    unsubscribe:() => void

    constructor( private value:KeyBoardValue, target:EventTarget ) {

        const downHandler = (event:KeyboardEvent) => {
            if (event.key === this.value) {
              if (this.isUp && this.press) this.press()
              this.isDown = true
              this.isUp = false
              event.preventDefault()
            }
          }
        
        const upHandler = (event:KeyboardEvent) => {
            if (event.key === this.value) {
              if (this.isDown && this.release) this.release()
              this.isDown = false
              this.isUp = true
              event.preventDefault()
            }
          }
        
        target.addEventListener( 'keydown', downHandler as EventListener, false )
        target.addEventListener( 'keyup', upHandler as EventListener, false )
    
        this.unsubscribe = () => {
            target.removeEventListener( 'keydown', downHandler as EventListener, false )
            target.removeEventListener( 'keyup', upHandler as EventListener, false )
    
        }
    }


  
}

export class Mouse {
    press?:( event:MouseEvent ) => void
    up?: ( event:MouseEvent ) => void
    move?: ( event:MouseEvent ) => void

    unsubscribe:() => void

    constructor( target:Element ) {

        const downHandler = (event:MouseEvent) => {
            if (this.press) this.press(event)
            event.preventDefault()
        }
        
        const upHandler = (event:MouseEvent) => {
            if (this.up) this.up(event)
            event.preventDefault()
        }

        const moveHandler = (event:MouseEvent) => {
          if (this.move) this.move(event)
          event.preventDefault()
        }
        
        target.addEventListener( 'mousedown', downHandler as EventListener, false )
        target.addEventListener( 'mouseup', upHandler as EventListener, false )
        target.addEventListener( 'mousemove', moveHandler as EventListener, false )
    
        this.unsubscribe = () => {
            target.removeEventListener( 'mousedown', downHandler as EventListener, false )
            target.removeEventListener( 'mouseup', upHandler as EventListener, false )
            target.removeEventListener( 'mousemove', moveHandler as EventListener, false )
        }

        
    }  

    /**
    * 
    * @param event 
    * @returns 
    */
    getMousePosition(event:MouseEvent):ScreenPosition|null {
      const elem = event.target as Element|null;

      if( elem == null ) return null

      const rect = elem.getBoundingClientRect()

      return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
      }
  }

}

export const keyboard = ( value:KeyBoardValue, target:EventTarget = document ) => (new Key(value, target))
export const mouse = ( target:Element ) => (new Mouse(target))
