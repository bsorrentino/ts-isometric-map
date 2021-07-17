

export namespace Iso {
    export type MapPosition = {
        x:number
        y:number
    }
    
    export type ScreenPosition = {
        x:number
        y:number
    }

    export type Size = {
        width:number
        height:number
    }

    export type MapParameters = {
        screen:Size
        mapSize:Size
        tileSize:Size
        canvasId?:string
        color?:string
    }
   
    export interface Entity {
        
        screenPos:ScreenPosition

        render():void
    }

    class Tile implements Entity { 

        constructor( public screenPos:MapPosition, private map:TileMap) {}
    
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

    class Prism implements Entity {

        /**
         * 
         * @param x - map x position
         * @param y - map y position
         * @param map 
         */
        constructor( public screenPos:ScreenPosition, private map:TileMap) {
        }

        render() {
            const {x,y} = this.screenPos

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

    class ImageEntity implements Entity {

        mapPos:MapPosition

        constructor( public source:HTMLImageElement, public screenPos:MapPosition, private map:TileMap) {

            this.mapPos = this.map.convertScreenToIsometric( screenPos )
        }

        render():void {
            // if( this.source.loading ) return
            const { x, y } = this.mapPos
            this.map.context.drawImage( this.source, x, y  )
        }
    }

    export class TileMap implements Entity {

        private _canvas:HTMLCanvasElement
        context:CanvasRenderingContext2D
        screenPos:Iso.ScreenPosition = {x:0, y:0}

        screenSize:Iso.Size
        mapSize:Iso.Size
        tile:Iso.Size & { color:string }

        mapPos:MapPosition

        renderLayers:[ Array<Entity>, Array<Entity> ] = [  [], [] ]

        gameLoopItnterval?:NodeJS.Timer

        images = new Map<string,HTMLImageElement>()

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
            this.mapSize = {
                width: params.mapSize.width,
                height: params.mapSize.height
            };
    
            // size of single tile
            this.tile = {
                width: params.tileSize.width,
                height: params.tileSize.height,
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
            for (let x = 0; x < this.mapSize.width; x++) {
                for ( let y = 0; y < this.mapSize.height; y++) {
                    // calculate coordinates
                    const pos = this.convertIsometricToScreen( {x:x, y:y }) 
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
                const result = new Prism( this.convertIsometricToScreen(map), this )
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
                (position.x >= 0 && position.x < this.mapSize.width 
                    && position.y >= 0 && position.y < this.mapSize.height) 


        /**
         * 
         * @param path 
         * @returns 
         */
        loadImages( ...paths: string[] )  {

            paths.forEach( path => {
                const basename = _basename(path)
                
                if( basename ) {
                    let result = new Image()
                    result.src = path
                    result.onload = ( event:any ) => {
                        console.log( `image ${basename} from path: ${path} loaded`, event )
                    }
                    this.images.set( basename, result)
                }
                else {
                    console.warn( `image path: ${path} is not valid!` )
                    // throw Error( `image path: ${path} is not valid!`)
                }
    
            })
        }
                   
        addImage = ( basename:string, screenPos:ScreenPosition, layer = 1  ) => {
            const img = this.images.get( basename )
            
            if( img ) {
                const result = new ImageEntity( img, screenPos, this )
                this.renderLayers[layer].push( result )
                this._sortLayer(layer)
                return result
            }

        }
    }

    /**
     * 
     * @param path 
     * @returns 
     */
    const _basename = ( path:string ):string|undefined => {
        const elem = path.split("/")
        if( elem.length > 0 ) {
            const last = elem[ elem.length - 1]
            const result = /(.+)[.](.+)$/.exec(last)    
            if( result != null ) {
                return result[1]
            }
        }

    } 


}


