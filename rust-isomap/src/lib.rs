mod utils;
mod iso;
mod image_future;

use std::{mem::MaybeUninit, sync::Mutex};

use iso::{ 
    TileMap,
};
use wasm_bindgen::{prelude::*, JsCast};
use web_sys::{ 
    console, 
    Document, 
    HtmlCanvasElement,
};


// When t&he `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen(js_namespace = window)]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    let msg = "WASM ISOMAP";

    alert( msg );

    console::log_1( &msg.into() )


}

///  Singleton pattern
///
///  [https://github.com/lpxxn/rust-design-pattern/blob/master/creational/singleton.rs]
///
fn tilemap() -> &'static Mutex<TileMap> {
    static mut SINGLETON: MaybeUninit<Mutex<TileMap>> = MaybeUninit::uninit();
    static ONCE: std::sync::Once = std::sync::Once::new();


    ONCE.call_once( || unsafe {

        let window = web_sys::window().expect("no global `window` exists");
        let document = window.document().expect("should have a document on window");
    
        let tilemap = 
                TileMap::builder()
                    // .canvas_id("canvas")
                    .build(&document).expect("impossible create tilemap");
                    
        SINGLETON.as_mut_ptr().write( Mutex::new(tilemap) );
    });

    unsafe {
         &*SINGLETON.as_ptr()
    }

}

// Called by our JS entry point to run the example
#[wasm_bindgen(start)]
//#[warn(unused_must_use)]
pub async fn run() -> Result<(), JsValue> {

    utils::set_panic_hook();
    
    {
        let mut tilemap  = tilemap().lock().unwrap();

        tilemap.load_images( &["assets/man-ne.png", "assets/man-nw.png"] ).await.expect("error loading images");
    
    }
    
 
    Ok(())
}


pub fn run_1() -> Result<(), JsValue> {

    utils::set_panic_hook();

    // Use `web_sys`'s global `window` function to get a handle on the global
    // window object.
    let window = web_sys::window().expect("no global `window` exists");
    let document = window.document().expect("should have a document on window");

    let body = document.body().expect("document should have a body");

    let canvas = get_canvas(&document).unwrap_throw();

    let txt_content = format!( "WASM ISOMAP : {}", &canvas.id() );

    // Manufacture the element we're gonna append
    let val = document.create_element("p")?;
    val.set_text_content(Some( &txt_content ));

    body.append_child(&val)?;

    Ok(())
}


fn get_canvas( document: &Document ) -> Result<HtmlCanvasElement, ()> {

    let canvas_id = "canvas";

    let expect_msg = format!("canvas id '{}' not found", canvas_id );
    
    let elem = document.get_element_by_id(canvas_id).expect( &expect_msg );

    elem.dyn_into::<HtmlCanvasElement>().map_err(|_| ())

}