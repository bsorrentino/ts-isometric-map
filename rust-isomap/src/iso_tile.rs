
use std::cmp::Ordering;

use wasm_bindgen::JsValue;
use web_sys::console;

use crate::iso::{
    TileRect,
    Size,
    Pos,
    TileMap, Entity, Comparable,
};
use crate::iso;

#[derive()]
pub struct Tile{

    pub highlight: bool,
    screen_pos: Pos,
    map_pos: Pos,
    // map: Weak<RefCell<&'a TileMap>>,
}


impl Tile {

    pub fn new( screen_pos: Pos, map_pos: Pos) -> Tile {
        

        Tile { 
            highlight: false, 
            screen_pos, 
            map_pos, 
            }
    }

    fn _draw_map_pos(&self, owner_ref: &TileMap ) {

        let TileMap { context, .. } = owner_ref;
        let Pos { x, y } = self.screen_pos; // topRight

        context.set_fill_style( &JsValue::from_str( "black" ) );

        let _ = context.fill_text( 
                &format!( "{},{}", self.map_pos.x, self.map_pos.y), 
                x - 40.0, 
                y + 20.0);

    }

    fn _draw_tile_rect(&self, owner_ref: &TileMap) {
        // Debug
        let TileMap { context, tile_size: Size { width, height }, .. } = owner_ref;
        let TileRect { top_left: Pos { x, y }, .. } = owner_ref.get_tile_rect(&self.screen_pos);
        context.begin_path();
        context.rect( x as f64, y as f64, *width as f64, *height as f64);
        context.stroke();

    }

    fn _render_image(&self, owner_ref: &TileMap) {

        let img = "cretebrick970";
        owner_ref.render_image_scaled(img, &self.screen_pos, &owner_ref.tile_size )
    }

    fn _render_lines(&self, owner_ref: &TileMap) {

        let v = owner_ref.get_tile_vertex(&self.screen_pos);
        
        let TileMap { context, ..} = owner_ref;

        //  * create four lines
        //  * --------------------------------------------
        //  *    step 1  |  step 2  |  step 3  |  step 4
        //  * --------------------------------------------
        //  *    /       |  /       |  /       |  /\  
        //  *            |  \       |  \/      |  \/
        //  * --------------------------------------------

        // begin
        context.begin_path();
        // move to start point
        context.move_to(v.top.x, v.top.y);
        // define lines
        context.line_to(v.left.x, v.left.y);
        context.line_to(v.bottom.x, v.bottom.y);
        context.line_to(v.right.x, v.right.y);
        context.line_to(v.top.x, v.top.y);       
        context.set_stroke_style( &JsValue::from_str("black") );

        // draw path
        context.stroke()
    

        // fill tile
        // context.fillStyle = (this.highlight) ? '#ffff00' : color
        // context.fill() 
    
    }


}



impl Entity for Tile {
    fn screen_pos(&self) -> &Pos {
        &self.screen_pos
    }
    
    fn render(&self, owner_ref: &TileMap ) -> Result<(), iso::Error> {
        // console::log_1( &"tile.render".into() );
        
        let TileMap { context, .. } = owner_ref;

        context.save();

        self._render_lines( owner_ref );

        // if( this.highlight ) {
        //     this._renderLines()
        // }
        // else  {
        //     this._renderImage()
        // }

        // Debug
        if self.highlight {
            self._draw_tile_rect( owner_ref );
            self._draw_map_pos( owner_ref );
        }

        context.restore();

        Ok(())
    }
    

}


impl Comparable for Box<Tile> {

    fn compare(&self, other: &Self) -> Ordering {

        console::log_1( &"tile.compare".into() );

        if self.highlight == other.highlight  { Ordering::Equal }
        else if self.highlight { Ordering::Greater }
        else { Ordering::Less }
    }
}
