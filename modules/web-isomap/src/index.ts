import * as wasm from "wasm-isomap";

wasm.init().then( () => {

    const render = () => {
        wasm.render();
        requestAnimationFrame(render);
    }

    requestAnimationFrame( render )
    

    // setInterval( () => wasm.render(), 1000 );
});

