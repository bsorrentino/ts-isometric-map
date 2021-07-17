
export namespace Iso {

    export type MapPosition = {
        x:number
        y:number
    }
    
    export type ScreenPosition = MapPosition

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
   
    export interface Entity {
        
        mapPos:MapPosition
        screenPos:ScreenPosition

        render():void
    }

    class Tile implements Entity { 

        screenPos:Iso.ScreenPosition = {x:0, y:0}

        constructor( public mapPos:MapPosition, private map:Map) {}
    
        render():void {
            const { context, tile: {width, height, color } } = this.map
    
            // begin
            context.beginPath()
    
            // move to start point
            context.moveTo(this.mapPos.x - width / 2, this.mapPos.y)
    
            /**
             * create four lines
             * --------------------------------------------
             *    step 1  |  step 2  |  step 3  |  step 4
             * --------------------------------------------
             *    /       |  /       |  /       |  /\  
             *            |  \       |  \/      |  \/
             * --------------------------------------------
             */
            context.lineTo(this.mapPos.x - width, this.mapPos.y + height / 2)
            context.lineTo(this.mapPos.x - width / 2, this.mapPos.y + height)
            context.lineTo(this.mapPos.x, this.mapPos.y + height / 2)
            context.lineTo(this.mapPos.x - width / 2,  this.mapPos.y)
    
            // draw path
            context.stroke()
    
            // fill tile
            context.fillStyle = color
            context.fill() 
             
        }
    }
    class Prism implements Entity {

        screenPos:ScreenPosition

        /**
         * 
         * @param x - map x position
         * @param y - map y position
         * @param map 
         */
        constructor( public mapPos:MapPosition, private map:Map, screen?:ScreenPosition) {
            
            this.screenPos = ( screen ) ? screen : map.convertIsometricToScreen(mapPos)
        }

        render() {
            const {x,y} = this.map.convertIsometricToScreen(this.mapPos)

            const { context, tile: {width, height, color } } = this.map
    
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

    export class Map implements Entity {

        private _canvas:HTMLCanvasElement
        context:CanvasRenderingContext2D
        screenPos:Iso.ScreenPosition = {x:0, y:0}

        screenSize:Iso.Size
        map:Iso.Size
        tile:Iso.Size & { color:string }

        mapPos:MapPosition

        renderLayers:[ Array<Entity>, Array<Entity> ] = [  [], [] ]

        gameLoopItnterval?:NodeJS.Timer

        /**
         * @desc constructor
         * @param object $params - initial parameters
         */
        constructor(params:MapParameters) {

            const canvas = document.getElementById(params.canvasId ?? 'canvas') as HTMLCanvasElement|null

            if( canvas == null ) throw new Error("canvas is null!")
            const context = canvas.getContext('2d')
            if( context == null ) throw new Error("2d context from canvas is null!")
            
            this._canvas = canvas
            this.context = context
        
            // canvas area details
            this.screenSize = { 
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
                height: params.tile.height,
                color: params.color ?? '#15B89A'
            }
    
            // initial position of isometric map
            this.mapPos = { x:this.screenSize.width / 2, y: this.tile.height }
            
        }
    
        /**
         * 
         */
        get canvas():HTMLCanvasElement {
            return this._canvas
        }

        /**
         * @desc draw isometric map
         */
        create() {
            // set canvas size
            this._canvas.setAttribute('width', `${this.screenSize.width}`);
            this._canvas.setAttribute('height', `${this.screenSize.height}`);

            // tiles drawing loops
            for (let i = 0; i < this.map.width; i++) {
                for ( let j = 0; j < this.map.height; j++) {
                    // calculate coordinates
                    const pos = {
                        x: (i-j) * this.tile.width / 2 + this.mapPos.x,
                        y: (i+j) * this.tile.height / 2 + this.mapPos.y
                    }
                    // draw single tile

                    this._addTile( pos )
                }
            }
            
            this.gameLoopItnterval = setInterval( () => this.render(), 500 )
        }
    
        render():void {

            this.renderLayers[0].forEach( v =>  v.render() )
            this.renderLayers[1].forEach( v =>  v.render() )

        }
        
        /**
         * @desc add a single tile to a layer
         * @param int $x - position x on canvas area
         * @param int $y - position y on canvas area
         * @param layer 
         */
        private _addTile = ( map:MapPosition, layer = 0):Tile => {
            const result = new Tile( map, this )
            this.renderLayers[layer].push( result )
            return result
        }

        private _sortLayer = ( layer:number ) => 
            this.renderLayers[layer].sort( ($1,$2) => {
                const dy = $1.screenPos.y - $2.screenPos.y 
                if( dy === 0 ) {
                    return $2.screenPos.x - $1.screenPos.x
                }
                return dy
            })
        

        /**
         * add single prism to a layer
         * @param x - position x on canvas area
         * @param y - position y on canvas area
         * @param layer 
         */
        addPrism = ( screen:ScreenPosition, layer = 1 ):Prism|undefined =>  {

            const map = this.convertScreenToIsometric(screen)

            if( this.isOnMap(map) ) {
                const result = new Prism( map, this, screen )
                this.renderLayers[layer].push( result )
                this._sortLayer(layer)
                return result
    
            }
        }

        /**
         * 
         * @param screen 
         * @returns 
         */
        convertScreenToIsometric( screen:ScreenPosition ):Iso.MapPosition{
            
            const x = (screen.x - this.mapPos.x) / this.tile.width
            const y = (screen.y - this.mapPos.y) / this.tile.height
    
           return { x: Math.floor(y + x) , y: Math.floor(y - x)  }
        }

        /**
         * 
         * @param map 
         * @returns 
         */
        convertIsometricToScreen = ( map:MapPosition ):Iso.ScreenPosition  => (
            {
                x: ( (map.x-map.y) * this.tile.width / 2 ) + this.mapPos.x,
                y: ( (map.x+map.y) * this.tile.height / 2 ) + this.mapPos.y

            })

    
        /**
         * 
         * @param position 
         * @returns 
         */
        isOnMap = (position:Iso.MapPosition):boolean  => 
                (position.x >= 0 && position.x < this.map.width 
                    && position.y >= 0 && position.y < this.map.height) 
        
    
    }

}


