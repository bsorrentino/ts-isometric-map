use std::{
    task::{
        Poll, Context,
    }, 
    pin::Pin, cell::Cell, rc::Rc, future::Future 
};

///
/// `see` [A Future for loading images via web-sys](https://users.rust-lang.org/t/a-future-for-loading-images-via-web-sys/42370)
/// 
use wasm_bindgen::{JsCast, prelude::Closure, JsValue};
use web_sys::{ 
    console,
    HtmlImageElement 
};

pub struct ImageFuture {
    image: Option<HtmlImageElement>,
    load_failed: Rc<Cell<bool>>,
}

impl ImageFuture {

    pub fn new(path: &str) -> Self {
        let image = HtmlImageElement::new().unwrap();
        image.set_src(path);
        ImageFuture {
            image: Some(image),
            load_failed: Rc::new(Cell::new(false)),
        }
    }

   fn get_image_path( &self ) -> Result<Rc<JsValue>,()> {
        match &self.image {
            Some(image) => Ok( Rc::new(image.src().into())),
            None => Err(())
        }
    }
}

impl Future for ImageFuture {
    type Output = Result<HtmlImageElement, ()>;

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        match &self.image {
            // image loading complete
            Some(image) if image.complete() => {
                let image = self.image.take().unwrap();
                let failed = self.load_failed.get();

                if failed {
                    Poll::Ready(Err(()))
                } else {
                    Poll::Ready(Ok(image))
                }
            }
            // image loading initialization
            Some(image) => {

                // image.onload closure
                let waker = cx.waker().clone();
                let image_path = self.get_image_path().unwrap();
                let on_load_closure = Closure::once(Box::new(move || {
                    console::log_2( &"image loaded at path:".into(), &*image_path);
                    waker.wake_by_ref();
                }) as Box<dyn FnMut()>);
                image.set_onload(Some(on_load_closure.as_ref().unchecked_ref()));
                on_load_closure.forget(); // possibly leak (see `--weak-ref` bindgen option )

                // image.onerror closure
                let waker = cx.waker().clone();
                let failed_flag = self.load_failed.clone();
                let image_path = self.get_image_path().unwrap();
                let on_error_closure = Closure::wrap(Box::new(move |err: &JsValue| {
                    console::warn_3( &"error loading image at path:".into(), &*image_path, err);
                    failed_flag.set(true);
                    waker.wake_by_ref();
                }) as Box<dyn FnMut(&JsValue)>);
                image.set_onerror(Some(on_error_closure.as_ref().unchecked_ref()));
                on_error_closure.forget();

                // image.onabort closure
                // let waker = cx.waker().clone();
                // let failed_flag = self.load_failed.clone();
                // let image_path = self.get_image_path().unwrap();
                // let on_abort_closure = Closure::wrap(Box::new(move |err: &JsValue| {
                //     console::warn_3( &"abort loading image at path:".into(), &*image_path, err);
                //     failed_flag.set(true);
                //     waker.wake_by_ref();
                // }) as Box<dyn FnMut(&JsValue)>);
                // image.set_onabort(Some(on_abort_closure.as_ref().unchecked_ref()));
                // on_abort_closure.forget();
                
                Poll::Pending
            },
            _ => Poll::Ready(Err(())),
        }
    }
}