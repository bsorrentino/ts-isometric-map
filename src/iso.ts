
import { basename } from './iso.utils'
import { Tile } from './iso.tile'


export enum Direction {
    NW, NE, SW, SE
}
export type Position = {
    x:number
    y:number
}

export type MapPosition = Position
export type ScreenPosition = Position

export type TileVertex = {
    top:Position
    left:Position
    right:Position
    bottom:Position
}

export type TileRect = {
    topRight:Position
    topLeft:Position
    bottomRight:Position
    bottomLeft:Position
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

    compare( e:Entity ):number
}

/**
 * 
 */
export abstract class BaseEntity implements Entity {

    constructor( public screenPos:Position ) {}

    abstract render(): void 

    compare(e: Entity): number {
        const dy = this.screenPos.y - e.screenPos.y 
        if( dy === 0 ) {
            return this.screenPos.x - e.screenPos.x
        }
        return dy
    }

}

/**
 * 
 */
export class TileMap implements Entity {

    private _canvas:HTMLCanvasElement
    context:CanvasRenderingContext2D
    screenPos:ScreenPosition = {x:0, y:0}

    screenSize:Size
    mapSize:Size
    tile:Size & { color:string }

    mapPos:MapPosition

    renderLayers:[ Array<Entity>, Array<Entity>, Array<Entity> ] = [  [], [], [] ]

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
        this.mapPos = { x:this.screenSize.width / 2, y: this.tile.height * 2 }
    }

    compare( e:TileMap ):number {
        return 0
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
        
        this.gameLoopItnterval = setInterval( () => this.render(), 1000/30 )
    }

    /**
     * 
     */
    render():void {
        this.clear()

        this.renderLayers[0]
            .sort( ($1,$2) => $1.compare($2) )
            .forEach( v =>  v.render() )

        this.renderLayers[1]
            .concat( this.renderLayers[2])
            .sort( ($1,$2) => $1.compare($2) )
            .forEach( v =>  v.render() )

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
     * @param predicate 
     * @returns 
     */
    private  _findEntity<T extends Entity>( layer:number, predicate:( entity:Entity, index:number ) => boolean ):T|undefined {
        return this.renderLayers[layer].find( predicate ) as T
    }

    /**
     * 
     * @param screenPos 
     */
    findTileByScreenPos( screenPos:ScreenPosition ) {
        return this._findEntity<Tile>( 0, ( e, i ) => {

            const isoPos = this.convertScreenToIso(screenPos)
            const { mapPos } = e as Tile

            return mapPos.x === isoPos.x && mapPos.y === isoPos.y 

        })
    }

    /**
     * 
     * @param screenPos 
     */
     findTileByIsoPos( isoPos:MapPosition ) {
        return this._findEntity<Tile>( 0, ( e, i ) => {

            const { mapPos } = e as Tile

            return mapPos.x === isoPos.x && mapPos.y === isoPos.y 

        })
    }

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
            return true

        }

        return false
    }

    /**
     * 
     * @param screen 
     * @returns 
     */
    convertScreenToIso( screen:ScreenPosition ):MapPosition {
        
        const x = (screen.x - this.mapPos.x) / this.tile.width
        const y = (screen.y - this.mapPos.y) / this.tile.height

        return { 
            x: Math.floor(y + x), 
            y: Math.floor(y - x)  
        }
    }

    /**
     * 
     * @param map 
     * @returns 
     */
    convertIsoToScreen = ( map:MapPosition ):ScreenPosition  => ({
            x: ( (map.x-map.y) * this.tile.width / 2 ) + this.mapPos.x,
            y: ( (map.x+map.y) * this.tile.height / 2 ) + this.mapPos.y
        })

    /**
     * 
     * @param pos 
     * @returns 
     */
     getTileVertex = (pos:ScreenPosition):TileVertex => ({
        top:    { x: pos.x - this.tile.width / 2, y: pos.y  },
        left:   { x: pos.x - this.tile.width, y: pos.y + this.tile.height / 2 },
        right:  { x: pos.x, y: pos.y + this.tile.height / 2 },
        bottom: { x: pos.x - this.tile.width / 2, y: pos.y + this.tile.height }
    })

    /**
     * 
     * @param pos 
     * @returns 
     */
    getTileRect = (pos:ScreenPosition):TileRect => ({
            topRight:       pos,
            bottomLeft:     { x: pos.x - this.tile.width, y: pos.y + this.tile.height },
            bottomRight:    { x:pos.x, y: pos.y + this.tile.height },
            topLeft:        { x: pos.x - this.tile.width, y: pos.y }
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
    
    renderImageScaled(basename:string, screenPos:ScreenPosition, toSize:Size) {
        const img = this.images.get( basename )

        if( img ) {
            const hRatio = toSize.width  / img.width    ;
            const vRatio =  toSize.height / img.height  ;
            const ratio  = Math.min ( hRatio, vRatio );

            const { bottomLeft: {x, y} } = this.getTileRect(screenPos)
            this.context.drawImage( 
                img, 
                0, 0,  
                img.width, img.height,
                x, y - toSize.height,
                img.width*ratio, img.height*ratio
                )    

        }

        //
        // @ref https://stackoverflow.com/a/23105310
        //
        // var canvas = ctx.canvas ;
        // var hRatio = canvas.width  / img.width    ;
        // var vRatio =  canvas.height / img.height  ;
        // var ratio  = Math.min ( hRatio, vRatio );
        // var centerShift_x = ( canvas.width - img.width*ratio ) / 2;
        // var centerShift_y = ( canvas.height - img.height*ratio ) / 2;  
        // ctx.clearRect(0,0,canvas.width, canvas.height);
        // ctx.drawImage(img, 0,0, img.width, img.height,
        //                    centerShift_x,centerShift_y,img.width*ratio, img.height*ratio);  
     } 

    /**
     * 
     * @param basename 
     * @param screenPos 
     */
    renderImage( basename:string, screenPos:ScreenPosition ):void {
        const source = this.images.get( basename )

        if( source ) {
            const { bottomLeft: {x, y} } = this.getTileRect(screenPos)
            this.context.drawImage( source, x, y - source!.naturalHeight )    
        }
    }

    /**
     * 
     * @param screenPos 
     * @param dir 
     * @param layer 
     * @param filter 
     * @returns 
     */
    checkCollision( screenPos:ScreenPosition, dir:Direction, layer = 1, filter?:(e:Entity) => boolean):boolean {

        const entities = (filter) ? 
                        this.renderLayers[layer].filter( filter ) : 
                        this.renderLayers[layer]

        const vt = this.getTileVertex(screenPos)

        let predicate:((e:Entity) => boolean)|undefined

        // console.log( 'collision', dir )
        switch( dir ) {
        case Direction.SW:
        case Direction.SE:
            predicate = ( e ) => {
                const { top, left } = this.getTileVertex(e.screenPos)
                const { x,y } = vt.left

                // console.log( vt.left, 'top', top, 'left', left )
                return ( x < top.x && x >= left.x ) &&
                       ( y > top.y && y <= left.y)
            }
            break
        case Direction.NW:
        case Direction.NE:
            predicate = ( e ) => {
                const { bottom, right } = this.getTileVertex(e.screenPos)
                const { x,y } = vt.right

                // console.log( vt.right, 'bottom', bottom, 'right', right )
                return ( x > bottom.x && x <= right.x ) &&
                       ( y < bottom.y && y >= right.y)
            }
            break
        }

        return ( predicate ) ?
            entities.find( predicate )!==undefined : false
    }

}



