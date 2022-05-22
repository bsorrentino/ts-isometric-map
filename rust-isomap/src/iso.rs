
use wasm_bindgen::JsCast;
use web_sys::{ 
    console, 
    Document, 
    Element,
    HtmlCanvasElement,
    CanvasRenderingContext2d,
};

#[derive(Default, Copy, Clone, PartialEq)]
struct Pos {
    x: i32,
    y: i32,
}

#[derive(Default, Copy, Clone, PartialEq)]
struct Size {
    width: i32,
    height: i32,
}

// impl Default for Size {
//     fn default() -> Self {
//         Self { width: 0, height: 0 }
//     }
// }

pub struct TileMap {
    map_size: Size,
    screen_pos: Pos,
    screen_size: Size,
    canvas: HtmlCanvasElement,
    context: CanvasRenderingContext2d,
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
    
    pub fn screen_size( mut self, size: Size ) -> TileMapBuilder {
        self.screen_size = size;
        self
    }

    pub fn map_size( mut self, size: Size ) -> TileMapBuilder {
        self.map_size = size;
        self
    }

    pub fn tile_size( mut self, size: Size ) -> TileMapBuilder {
        self.tile_size = size;
        self
    }

    pub fn canvas_id( mut self, id: &str ) -> TileMapBuilder {
        self.canvas_id = Some(String::from(id));
        self
    }

    pub fn color( mut self, color: &str ) -> TileMapBuilder {
        self.color = Some(String::from(color));
        self
    }

    pub fn build( &self, document: &Document ) -> Result<TileMap, String> {

        let def_canvas_id = String::from("canvas");
        let canvas_id = self.canvas_id.as_ref().unwrap_or( &def_canvas_id);

        let canvas = {
            let expect_msg_1 = format!("canvas id '{}' not found", canvas_id );
            let elem = document.get_element_by_id(canvas_id).expect( &expect_msg_1 );
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
            canvas, 
            context,
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
     * 
     * @param basename 
     * @param screenPos 
     */
    fn renderImage( basename: &str, screen_pos: &Pos ) -> () {
        // const source = this.images.get( basename )

        // if( source ) {
        //     const { bottomLeft: {x, y} } = this.getTileRect(screenPos)
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




