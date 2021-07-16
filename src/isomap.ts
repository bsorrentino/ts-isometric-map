
export namespace Iso {

    export type Position = {
        x:number
        y:number
    }

    export type Size = {
        width:number
        height:number
    }

    export type MapParameters = {
        screen:Size
        map:Size
        tile:Size
        canvasId?:string
        color?:string
    }
   
    export class Map {

        canvas:HTMLCanvasElement
        context:CanvasRenderingContext2D
        color:string
        screen:Iso.Size
        map:Iso.Size
        tile:Iso.Size
        position:Iso.Position
    
        /**
         * @desc constructor
         * @param object $params - initial parameters
         */
        constructor(params:MapParameters) {

            const canvas = document.getElementById(params.canvasId ?? 'canvas') as HTMLCanvasElement|null
            if( canvas == null ) throw new Error("canvas is null!")
            const context = canvas.getContext('2d')
            if( context == null ) throw new Error("2d context from canvas is null!")
            
            this.canvas = canvas
            this.context = context
    
            // tiles color
            this.color = params.color ?? '#15B89A';
    
            // canvas area details
            this.screen = { 
                width: params.screen.width,
                height: params.screen.height
             };
    
            // size of isometric map
            this.map = {
                width: params.map.width,
                height: params.map.height
            };
    
            // size of single tile
            this.tile = {
                width: params.tile.width,
                height: params.tile.height
            }
    
            // initial position of isometric map
            this.position = {
                x: this.screen.width / 2,
                y: this.tile.height
            }
        }
    
        /**
         * @desc draw isometric map
         */
        create() {
            // set canvas size
            this.canvas.setAttribute('width', `${this.screen.width}`);
            this.canvas.setAttribute('height', `${this.screen.height}`);
    
            // tiles drawing loops
            for (let i = 0; i < this.map.width; i++) {
                for ( let j = 0; j < this.map.height; j++) {
                    // calculate coordinates
                    var x = (i-j) * this.tile.width / 2 + this.position.x;
                    var y = (i+j) * this.tile.height / 2 + this.position.y;
                    // draw single tile
                    this.drawTile(x, y);
                }
            }
    
            // add event listeners
            this.addListeners();
        };
    
        /**
         * @desc draw single tile
         * @param int $x - position x on canvas area
         * @param int $y - position y on canvas area
         */
        drawTile(x:number, y:number) {
            
            const tileWidth = this.tile.width;
            const tileHeight = this.tile.height;
    
    
            // begin
            this.context.beginPath();
    
            // move to start point
            this.context.moveTo(x - tileWidth / 2, y);
    
            /**
             * create four lines
             * --------------------------------------------
             *    step 1  |  step 2  |  step 3  |  step 4
             * --------------------------------------------
             *    /       |  /       |  /       |  /\  
             *            |  \       |  \/      |  \/
             * --------------------------------------------
             */
            this.context.lineTo(x - tileWidth, y + tileHeight / 2);
            this.context.lineTo(x - tileWidth / 2, y + tileHeight);
            this.context.lineTo(x, y + tileHeight / 2);
            this.context.lineTo(x - tileWidth / 2,  y);
    
            // draw path
            this.context.stroke();
    
            // fill tile
            this.context.fillStyle = this.color;
            this.context.fill();   
        }
    
        /**
         * @desc draw single shape - prism
         * @param object $isometricPosition - position on map { x: value, y: value }
         */
        drawPrism(isometricPosition:Iso.Position) {

            const screenPosition = this.convertIsometricToScreen(isometricPosition.x, isometricPosition.y);
            const x = screenPosition.x;
            const y = screenPosition.y;
            const tileWidth = this.tile.width;
            const tileHeight = this.tile.height;
    
            // top
            this.context.beginPath();
    
            this.context.moveTo(x - tileWidth / 2, y - tileHeight);
            this.context.lineTo(x - tileWidth, y - tileHeight / 2);
            this.context.lineTo(x - tileWidth / 2, y);
            this.context.lineTo(x, y - tileHeight / 2);
            this.context.lineTo(x - tileWidth / 2,  y - tileHeight);
    
            this.context.fillStyle = '#555555';
            this.context.fill();
    
            // left
            this.context.beginPath();
    
            this.context.moveTo(x - tileWidth, y - tileHeight / 2);
            this.context.lineTo(x - tileWidth, y + tileHeight / 2);
            this.context.lineTo(x - tileWidth / 2, y + tileHeight);
            this.context.lineTo(x - tileWidth / 2, y);
            this.context.lineTo(x - tileWidth, y - tileHeight / 2);
    
            this.context.fillStyle = '#444444';
            this.context.fill();
    
            // right
            this.context.beginPath();
    
            this.context.moveTo(x - tileWidth / 2, y);
            this.context.lineTo(x, y - tileHeight / 2);
            this.context.lineTo(x, y + tileHeight / 2);
            this.context.lineTo(x - tileWidth / 2, y + tileHeight);
            this.context.lineTo(x - tileWidth / 2, y);
    
            this.context.fillStyle = '#777777';
            this.context.fill();
        }
    
        /**
         * @desc init map listeners
         */
        addListeners() {
    
            this.canvas.addEventListener('mousedown', (event) => {
                const mousePosition = getMousePosition(event);

                if( mousePosition != null ) {
                    const isometricPosition = this.convertScreenToIsometric(mousePosition.x, mousePosition.y);
    
                    if( isOnMap(isometricPosition, this.map)) {
                        this.drawPrism(isometricPosition);
                    }
    
                }

            }, false);
    
        }
    
        convertScreenToIsometric(x:number, y:number):Iso.Position{
            x = (x - this.position.x) / this.tile.width;
            y = (y - this.position.y) / this.tile.height;
    
            var isoX = Math.floor(y + x) 
            var isoY = Math.floor(y - x) 
    
           return { x: isoX, y: isoY };
        };
    
        convertIsometricToScreen(x:number, y:number):Iso.Position {
            var screenX = ( (x-y) * this.tile.width / 2 ) + this.position.x;
            var screenY = ( (x+y) * this.tile.height / 2 ) + this.position.y;
    
            return { x: screenX, y: screenY};
        };
    
    
    }

    /**
     * 
     * @param event 
     * @returns 
     */
    function getMousePosition(event:MouseEvent):Iso.Position|null {
        const canvas = event.target as HTMLCanvasElement|null;

        if( canvas == null ) return null

        const rect = canvas.getBoundingClientRect()

        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        }
    }

    /**
     * 
     * @param position 
     * @param map 
     * @returns 
     */
    export function isOnMap(position:Iso.Position, map:Iso.Size):boolean  {
        if (position.x >= 0 && position.x < map.width 
            && position.y >= 0 && position.y < map.height) {
                return true;
        } else {
            return false;
        }
    };

}


