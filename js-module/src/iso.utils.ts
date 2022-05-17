/**
 * 
 * @param path 
 * @returns 
 */
export const basename = ( path:string ):string|undefined => {
    const elem = path.split("/")
    if( elem.length > 0 ) {
        const last = elem[ elem.length - 1]
        const result = /(.+)[.](.+)$/.exec(last)    
        if( result != null ) {
            return result[1]
        }
    }
} 
    
