mod iso;

pub struct Image {
    screen_pos: Pos,
    basename: &str,
    map: Rc<TileMap>,
}

impl Entity for Image {

    fn screen_pos(&self) -> &Pos {
        &self.screen_pos
    }
    
    fn render(&self) -> Result<(), iso::Error> {
        self.map.render_image( self.basename, self.screen_pos )
    }

}

