function start_render_loop( render_task ) {

    if( !render_task ) throw 'render_task not defined!'

    const render_refresh = () => {
        render_task();
        requestAnimationFrame(render_refresh);
    }

    requestAnimationFrame( render_refresh )
    
}