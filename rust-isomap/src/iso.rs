
use web_sys::{ 
    console, 
    HtmlCanvasElement,
};

#[derive(Copy, Clone)]
struct Pos {
    x: i32,
    y: i32,
}


trait Entity<Rhs = Self> where Rhs: Entity  {
    fn screen_pos(&self) -> &Pos;

    fn render(&self);

    // default implementation
    fn compare( &self, other: Rhs ) -> i32 {
        let my_pos =  self.screen_pos();
        let other_pos = other.screen_pos();
        let dy = my_pos.y - other_pos.y;

        if dy == 0 { my_pos.x - other_pos.x } else { dy }
    }
}

// impl PartialEq for dyn Entity {

//     fn eq(&self, other: &Self) -> bool {
//         self.screen_pos().x == other.screen_pos.x && 
//         self.screen_pos.y == other.screen_pos.y
//     }

// }

struct TileMap {
    screen_pos: Pos,
    _canvas: HtmlCanvasElement,
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

impl Entity for TileMap {

    fn screen_pos(&self) -> &Pos {
        &self.screen_pos
    }
    
    fn render(&self) {
        
    }

}



