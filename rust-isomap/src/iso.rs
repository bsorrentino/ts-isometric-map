
use std::{ collections::HashMap, cmp::Ordering};
use wasm_bindgen::{JsCast, JsValue};
use web_sys::{ 
    console, 
    Document, 
    HtmlCanvasElement,
    CanvasRenderingContext2d, HtmlImageElement
};

use crate::{image_future::ImageFuture, iso_tile::Tile};

type Measure = f64;

#[repr(u8)]
#[derive(Copy, Clone, PartialEq)]
pub enum Layer {
    PrismLayer = 0,
    PersonLayer = 1,
}

#[derive()]
pub enum Error {
    ImageNotFound( String ),
    RenderImage( JsValue ),
}
    
#[derive(Default, Copy, Clone, PartialEq)]
pub struct Pos {
    pub x: Measure,
    pub y: Measure,
}

#[derive(Default, Copy, Clone, PartialEq)]
pub struct Size {
    pub width: u32,
    pub height: u32,
}

// impl Default for Size {
//     fn default() -> Self {
//         Self { width: 0, height: 0 }
//     }
// }

#[derive(Default, Copy, Clone, PartialEq)]
pub struct TileRect {
    pub top_right: Pos,
    pub top_left: Pos,
    pub bottom_right:Pos,
    pub bottom_left:Pos,
}

#[derive(Default, Copy, Clone, PartialEq)]
pub struct TileVertex {
    pub top:Pos,
    pub left:Pos,
    pub right:Pos,
    pub bottom:Pos,
}

pub trait Entity {
    fn screen_pos(&self) -> &Pos;

    fn render(&self, owner_ref: &TileMap) -> Result<(), Error>;

}

pub trait Comparable {

    fn compare(&self, other: &Self) -> Ordering;

}

impl Comparable for Box<dyn Entity> {

    fn compare(&self, other: &Box<dyn Entity>) -> Ordering {

        console::log_1( &"entity.compare".into() );

        let my_pos =  self.screen_pos();
        let other_pos = other.screen_pos();
        let dy = my_pos.y - other_pos.y;

        if dy == 0.0 { Ordering::Equal } 
        else if dy > 0.0 { Ordering::Greater }
        else { Ordering::Less}

    }
}

#[derive()]
pub struct TileMap {
    // screen_pos: Pos,
    // screen_size: Size,
    map_pos: Pos,
    map_size: Size,
    pub tile_size: Size,
    pub tile_color: String, 
    tile_half_size: Size,
    canvas: HtmlCanvasElement,
    pub context: CanvasRenderingContext2d,
    images: HashMap<String,HtmlImageElement>,
    // https://stackoverflow.com/a/51486416/521197
    render_tiles_layer: Vec<Box<Tile>>,
    render_entity_layers: [ Vec<Box<dyn Entity>>; 2 ],
}

#[derive(Default)]
pub struct TileMapBuilder {
    screen_size: Size,
    map_size: Size,
    tile_size: Size,
    canvas_id: Option<String>,
    color: Option<String>,
}

// impl Default for TileMapBuilder {
//     fn default() -> Self {
//         Self { 
//             screen_size: Size::default(), 
//             map_size: Size::default(), 
//             tile_size: Size::default(), 
//             canvas_id: String::from("canvas"), 
//             color: String::from("#15B89A") }
//     }
// }

impl TileMapBuilder {
    

    pub fn with_screen_size( mut self, size: Size ) -> TileMapBuilder {
        self.screen_size = size;
        self
    }

    pub fn with_map_size( mut self, size: Size ) -> TileMapBuilder {
        self.map_size = size;
        self
    }

    pub fn with_tile_size( mut self, size: Size ) -> TileMapBuilder {
        self.tile_size = size;
        self
    }

    pub fn with_canvas_id( mut self, id: &str ) -> TileMapBuilder {
        self.canvas_id = Some(String::from(id));
        self
    }

    pub fn with_color( mut self, color: &str ) -> TileMapBuilder {
        self.color = Some(String::from(color));
        self
    }

    pub fn build( &self, document: &Document ) -> Result<TileMap, String> {

        let canvas_id = match &self.canvas_id {
            Some(id) => String::from(id),
            None => String::from("canvas")
        };

        let canvas = {
            let expect_msg_1 = format!("canvas id '{}' not found", canvas_id );
            let elem = document.get_element_by_id(&canvas_id).expect( &expect_msg_1 );
            let expect_msg_2 = format!("element id '{}' is a not valid Canvas object!", canvas_id );
            elem.dyn_into::<HtmlCanvasElement>().expect( &expect_msg_2 )
        };

        let context = { 
            let expect_msg_1 = format!("{}.get_context('2d') has failed!", canvas_id );
            let expect_msg_2 = format!("{}.get_context('2d') return null!", canvas_id );
            let context = canvas.get_context("2d")
                .expect( &expect_msg_1 )
                .expect( &expect_msg_2 );
            let expect_msg_3 = format!("{}.get_context('2d') returns an invalid CanvasRenderingContext2d object!", canvas_id );
            context.dyn_into::<CanvasRenderingContext2d>()
                .expect( &expect_msg_3 )
        };
        
        let s_width = format!( "{}", self.screen_size.width);
        let s_height = format!( "{}", self.screen_size.height);

        console::log_2( &JsValue::from_str(s_width.as_str()), &JsValue::from_str(s_height.as_str()) );
        // set canvas size
        let _ = canvas.set_attribute("width",  s_width.as_str());
        let _ = canvas.set_attribute("height", s_height.as_str());

        let tilemap = TileMap { 
            // screen_pos: Pos::default(), 
            // screen_size: self.screen_size,
            map_pos: Pos { 
                x: (self.screen_size.width / 2) as f64,
                y: (self.tile_size.height * 2) as f64,
            },
            map_size: self.map_size, 
            tile_size: self.tile_size,
            tile_half_size: Size { 
                height: self.tile_size.height / 2,
                width: self.tile_size.width / 2,
            },
            tile_color: match &self.color {
                Some(v) => String::from(v),
                None => String::from("#15B89A"),
            },
            canvas, 
            context,
            images: HashMap::new(),
            render_tiles_layer: Vec::new(),
            render_entity_layers: [ Vec::new(), Vec::new() ],

        };

        

        Ok(tilemap)
    }

} 

// impl PartialEq for Pos {

//     fn eq(&self, other: &Pos) -> bool {
//         return self.x == other.x && self.y == self.y
//     }
// }

impl TileMap {

    /**
     * @return Builder
     */
    pub fn builder() -> TileMapBuilder {
        TileMapBuilder::default()
    }

    fn _clear(&self) {
        self.context.clear_rect(0.0, 0.0, self.canvas.width() as f64, self.canvas.height() as f64 )
    } 

    fn _update_layer( &mut self, layer:Layer ) {

        let r_layer = 
            match layer {
                Layer::PrismLayer => &mut self.render_entity_layers[ 0 ],
                Layer::PersonLayer => &mut self.render_entity_layers[ 1 ],
            };
        
        
        r_layer.sort_by( |a, b | { a.compare( b ) } );


    }

    pub fn render(&self) -> Result<(), Error> {
        // console::log_1( &"isomap.render".into() );

        self._clear();

        for e in self.render_tiles_layer.iter() {
            let _ = e.render(self);
        }

        for layer_index in 0..1 {
            for e in self.render_entity_layers[ layer_index ].iter() {
                let _ = e.render(self);
            }         
        }
        
        Ok(())
    }

    /// Get Tile Rect relative to screen pos
    pub fn get_tile_rect( &self, screen_pos: &Pos ) -> TileRect {
        // topRight:       pos,
        // bottomLeft:     { x: pos.x - this.tile.width, y: pos.y + this.tile.height },
        // bottomRight:    { x:pos.x, y: pos.y + this.tile.height },
        // topLeft:        { x: pos.x - this.tile.width, y: pos.y }

        TileRect {
            top_right:       *screen_pos,
            bottom_left:     Pos { x: screen_pos.x - self.tile_size.width as f64, y: screen_pos.y + self.tile_size.height as f64 },
            bottom_right:    Pos { x: screen_pos.x, y: screen_pos.y + self.tile_size.height as f64},
            top_left:        Pos { x: screen_pos.x - self.tile_size.width as f64, y: screen_pos.y },
        }
    }

    pub fn get_tile_vertex( &self, screen_pos: &Pos ) -> TileVertex {
        // top:    { x: pos.x - this.tile.width/2, y: pos.y  },
        // left:   { x: pos.x - this.tile.width, y: pos.y + this.tile.height/2 },
        // right:  { x: pos.x, y: pos.y + this.tile.height/2 },
        // bottom: { x: pos.x - this.tile.width/2, y: pos.y + this.tile.height }

        TileVertex {
            top:    Pos { x: screen_pos.x - self.tile_half_size.width as f64, y: screen_pos.y  },
            left:   Pos { x: screen_pos.x - self.tile_size.width as f64, y: screen_pos.y + self.tile_half_size.height  as f64},
            right:  Pos { x: screen_pos.x, y: screen_pos.y + self.tile_half_size.height as f64 },
            bottom: Pos { x: screen_pos.x - self.tile_half_size.width as f64, y: screen_pos.y + self.tile_size.height as f64 }    
        }
    }

    /**
     * 
     * @param layer 
     */
    pub fn add_tiles( &mut self ) {

        // tiles drawing loops
        for  x  in 0..self.map_size.width {
            for y in  0..self.map_size.height  {
                self._add_tile( &Pos { x: x as f64, y: y as f64 } );
            }
        }

        self.render_tiles_layer.sort_by( |a, b | { a.compare( b ) });
    }

    fn _add_tile( &mut self, map_pos: &Pos )  {
        let screen_pos = self.convert_map_to_screen( map_pos ); 
        let result = Box::new(Tile::new( screen_pos, *map_pos ));
        
        self.render_tiles_layer.push( result );
    }

    pub fn convert_map_to_screen( &self, tile_pos: &Pos ) -> Pos { 
        // x: (this.tile.halfWidth * ( tilePos.x - tilePos.y )) + this.mapPos.x, 
        // y: (this.tile.halfHeight  * ( tilePos.x + tilePos.y )) + this.mapPos.y

        Pos {
            x: (self.tile_half_size.width as f64 * ( tile_pos.x - tile_pos.y )) + self.map_pos.x, 
            y: (self.tile_half_size.height as f64 * ( tile_pos.x + tile_pos.y )) + self.map_pos.y
    
        }
    }

    pub async fn load_images( &mut self, images: &[&str] ) -> Result<(), ()> {
        
        let img_future_arr = 
                    images.iter()
                        .map( |path| (*path, ImageFuture::new(*path)) );
                        

        for (path, future) in img_future_arr {

            match future.await {
                Ok(img) => self.images.insert( String::from(path), img ),
                Err(_err) => None
            };
            

        }

        Ok(())
        
    }

    /**
     * 
     * @param basename 
     * @param screenPos 
     */
    pub fn render_image( &self, basename: &str, screen_pos: &Pos ) -> Result<(), Error> {

        let source = match self.images.get( basename ) {
            Some(it) => it,
            _ => return Err( Error::ImageNotFound( String::from(basename)))
        };

        let TileRect {  
            bottom_left : Pos { x: dx, y }, 
            top_right: _, 
            top_left: _,
            bottom_right: _}  = self.get_tile_rect(screen_pos);

        let dy  = y - source.natural_height() as f64;

        match self.context.draw_image_with_html_image_element(source, dx, dy) {
            Ok(()) => Ok(()),
            Err(js_err) => Err(Error::RenderImage(js_err))

        }


    }

    pub fn render_image_scaled( &self, basename: &str, screen_pos: &Pos, to_size: &Size ) {
        // const img = this.images.get( basename )

        // if( img ) {
        //     const hRatio = toSize.width  / img.width    ;
        //     const vRatio =  toSize.height / img.height  ;
        //     const ratio  = Math.min ( hRatio, vRatio );

        //     const { bottomLeft: {x, y} } = this.getTileRect(screenPos)
        //     this.context.drawImage( 
        //         img, 
        //         0, 0,  
        //         img.width, img.height,
        //         x, y - toSize.height,
        //         img.width*ratio, img.height*ratio
        //         )    
        // }

        let img = self.images.get( basename );

        if let  Some(img) = img  {

            let h_ratio = to_size.width  / img.width()    ;
            let v_ratio =  to_size.height / img.height()  ;
            let ratio  = std::cmp::min( h_ratio, v_ratio );
            
            let TileRect { bottom_left: Pos { x, y }, .. } = self.get_tile_rect( screen_pos );

            let _ = self.context.draw_image_with_html_image_element_and_sw_and_sh_and_dx_and_dy_and_dw_and_dh(
                img, 
                0.into(), 0.into(), 
                img.width().into(), img.height().into(),
                x, y, 
                (img.width()*ratio).into(), (img.height()*ratio).into());
        }
        
     } 


    // pub fn start( &mut self, fps: u16 ) -> Result<(), JsValue>{

    //     let window = web_sys::window().unwrap();
        

    //     match window.set_interval_with_callback_and_timeout_and_arguments_0(
    //             self._render_closure.as_ref().unwrap().as_ref().unchecked_ref(), 
    //             (1000/fps) as i32) {
    //         Ok(token) => { 
    //             self._game_loop_interval = token;
    //             Ok(())
    //         },
    //         Err(js_err) => Err(js_err)     
    //     }
    // }

}   




