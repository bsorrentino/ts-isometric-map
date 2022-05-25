
use std::{iter, future, collections::HashMap};

use wasm_bindgen::JsCast;
use web_sys::{ 
    console, 
    Document, 
    HtmlCanvasElement,
    CanvasRenderingContext2d, HtmlImageElement,
};

use crate::image_future::ImageFuture;

#[derive(Default, Copy, Clone, PartialEq)]
pub struct Pos {
    x: i32,
    y: i32,
}

#[derive(Default, Copy, Clone, PartialEq)]
pub struct Size {
    width: i32,
    height: i32,
}

// impl Default for Size {
//     fn default() -> Self {
//         Self { width: 0, height: 0 }
//     }
// }

#[derive(Default, Copy, Clone, PartialEq)]
pub struct TileRect {
    top_right: Pos,
    top_left: Pos,
    bottom_right:Pos,
    bottom_left:Pos,
}

pub struct TileMap {
    map_size: Size,
    screen_pos: Pos,
    screen_size: Size,
    tile_size: Size,
    tile_color: String, 
    tile_half_width: i32,
    tile_half_height:i32,
    canvas: HtmlCanvasElement,
    context: CanvasRenderingContext2d,
    images: HashMap<String,HtmlImageElement>,
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
        
        Ok(TileMap { 
            map_size: self.map_size, 
            screen_pos: Pos::default(), 
            screen_size: self.screen_size,
            tile_size: self.tile_size,
            tile_half_height: self.tile_size.height / 2,
            tile_half_width: self.tile_size.height / 2,
            tile_color: match &self.color {
                Some(v) => String::from(v),
                None => String::from("#15B89A"),
            },
            canvas, 
            context,
            images: HashMap::new(),
        })
    }

} 

// impl PartialEq for Pos {

//     fn eq(&self, other: &Pos) -> bool {
//         return self.x == other.x && self.y == self.y
//     }
// }


trait Entity<Rhs: ?Sized = Self> : PartialEq<Rhs> where Rhs: Entity  {
    fn screen_pos(&self) -> &Pos;

    fn render(&self);

    fn compare( &self, other: &Self ) -> i32 {
        let my_pos =  self.screen_pos();
        let other_pos = other.screen_pos();
        let dy = my_pos.y - other_pos.y;

        if dy == 0 { my_pos.x - other_pos.x } else { dy }
    }

}

impl TileMap {

    /**
     * @return Builder
     */
    pub fn builder() -> TileMapBuilder {
        TileMapBuilder::default()
    }

    /// Get Tile Rect relative to screen pos
    pub fn get_tile_rect( &self, screen_pos: &Pos ) -> TileRect {
        TileRect {
            top_right:       *screen_pos,
            bottom_left:     Pos { x: screen_pos.x - self.tile_size.width, y: screen_pos.y + self.tile_size.height },
            bottom_right:    Pos { x: screen_pos.x, y: screen_pos.y + self.tile_size.height },
            top_left:        Pos { x: screen_pos.x - self.tile_size.width, y: screen_pos.y },
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
    fn render_image( &self, basename: &str, screen_pos: &Pos ) -> () {

        let source = self.images.get( basename );
        // const source = this.images.get( basename )

        // if( source ) {
        //     const { bottomLeft: {x, y} } = this.get_tile_rect(screenPos)
        //     this.context.drawImage( source, x, y - source!.naturalHeight )    
        // }
    }

}   

impl PartialEq for TileMap {
    fn eq(&self, other: &Self ) -> bool {
        self.compare(other) == 0
    }
}

impl Entity for TileMap {

    fn screen_pos(&self) -> &Pos {
        &self.screen_pos
    }
    
    fn render(&self) {
        
    }
}




