#![recursion_limit = "1024"]

use console_error_panic_hook::set_once as set_panic_hook;
use wasm_bindgen::{prelude::*, JsCast};
use web_sys::{ window, HtmlCanvasElement, CanvasRenderingContext2d };


fn start_app() {
    let document = window()
        .and_then(|win| win.document())
        .expect("Could not access document");
    // let body = document.body().expect("Could not access document.body");
    // let text_node = document.create_text_node("Hello, world from Vanilla Rust!");
    // body.append_child(text_node.as_ref()).expect("Failed to append text");

    let canvas = document.get_element_by_id("canvas")
                            .expect("Element 'canvas' not found!");   

    let canvas = canvas.dyn_into::<HtmlCanvasElement>()
                            .expect("Element 'canvas' is not a Canvas Element!");     

    let context = canvas.get_context("2d")
                                    .expect("Fail getting context result!")
                                    .expect("Fail getting context!");

    let context = context.dyn_into::<CanvasRenderingContext2d>()
            .expect("Context is not a CanvasRenderingContext2d!");    

    const ROWS: usize = 5;
    const COLS: usize = 5;

    let  map: [[i32; 5]; 5] = [
                [0,0,0,0,0],
                [0,0,1,0,0],
                [0,0,0,0,0],
                [-2,-1, 0 ,-1,-2],
                [0,0,0,0,0]
              ];

    for depth in -10..10 {
        
        (0..ROWS).for_each(|j| {

          for i in 0..COLS {

            if map[j][i] == depth {

              let ii = i as f64;
              let jj = j as f64;
              let v =  map[j][i] as f64;

              // console.log(i,j);
              tile( &context, 
                    100.0 * (ii + jj + 1.0), 
                    300.0 + 50.0 * ( ii - jj ) - v * 20.0);
            } 
          }
        });
      }
      
}

/// function that drow tiles
fn tile( c: &CanvasRenderingContext2d, x: f64, y: f64 ) {

    static mut HUE: f64 = 0.0;
    
    c.begin_path();
    c.move_to(x-100.0, y);
    c.line_to(x, y-50.0);
    c.line_to(x+100.0, y);
    c.line_to(x, y+50.0);
    c.close_path();
    c.stroke();

    // unsafe required for mutable static variables
    let fill_style = unsafe {
        if HUE == 0.0 {
          HUE = random() * 360.0;
        }

        let hsl_func = format!("hsl( {}, 50%, 50%)", HUE );
        JsValue::from_str( &hsl_func )
    };   

    c.set_fill_style( &fill_style );

    c.fill(); 
  
}

#[wasm_bindgen]
extern "C" {                                 
    #[wasm_bindgen(js_namespace = Math)]     
    fn random() -> f64;
}

#[wasm_bindgen(inline_js = "export function snippetTest() { console.log('Hello from JS FFI!'); }")]
extern "C" {
    fn snippetTest();
}

#[wasm_bindgen]           
pub fn render() {
  start_app();
}

fn main() {
    set_panic_hook();
    start_app();
}
