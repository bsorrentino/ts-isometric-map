
import { basename } from './iso.utils'
import { Tile } from './ios.tile'

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






export class TileMap implements Entity {

    private _canvas:HTMLCanvasElement
    context:CanvasRenderingContext2D
    screenPos:ScreenPosition = {x:0, y:0}

    screenSize:Size
    mapSize:Size
    tile:Size & { color:string }

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
     * 
     * @returns 
     */
    clear = () => this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    

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
                this._addTile( {x:x, y:y } )
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
        const screen = this.convertIsoToScreen( map) 
        const result = new Tile( screen, map, this )
        this.renderLayers[layer].push( result )
        return result
    }

    /**
     * 
     * @param layer 
     * @returns 
     */
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
    addEntity = <T extends Entity>( entity:T, layer = 1 ):boolean =>  {

        const map = this.convertScreenToIso(entity.screenPos)

        if( this.isOnMap(map) ) {
            this.renderLayers[layer].push( entity )
            this._sortLayer(layer)
            return true

        }

        return false
    }

    /**
     * 
     * @param screen 
     * @returns 
     */
    convertScreenToIso( screen:ScreenPosition ):MapPosition{
        
        const x = (screen.x - this.mapPos.x) / this.tile.width
        const y = (screen.y - this.mapPos.y) / this.tile.height

        return { x: Math.floor(y + x) , y: Math.floor(y - x)  }
    }

    /**
     * 
     * @param map 
     * @returns 
     */
    convertIsoToScreen = ( map:MapPosition ):ScreenPosition  => (
        {
            x: ( (map.x-map.y) * this.tile.width / 2 ) + this.mapPos.x,
            y: ( (map.x+map.y) * this.tile.height / 2 ) + this.mapPos.y

        })


    /**
     * 
     * @param position 
     * @returns 
     */
    isOnMap = (position:MapPosition):boolean  => 
            (position.x >= 0 && position.x < this.mapSize.width 
                && position.y >= 0 && position.y < this.mapSize.height) 


    /**
     * 
     * @param path 
     * @returns 
     */
    loadImages( ...paths: string[] )  {

        paths.forEach( path => {
            const name = basename(path)
            
            if( name ) {
                let result = new Image()
                result.src = path
                result.onload = ( event:any ) => {
                    console.log( `image ${name} from path: ${path} loaded`, event )
                }
                this.images.set( name, result)
            }
            else {
                console.warn( `image path: ${path} is not valid!` )
                // throw Error( `image path: ${path} is not valid!`)
            }

        })
    }
}



