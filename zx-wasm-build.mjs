#!/usr/bin/env node
import 'zx/globals'

const rust_project_path = './rust-isomap'

if( argv.bindgen ) {
    await wasm_bindgen()
}
else {
    const wasm_pack_out_dir = path.join( '..', 'modules', 'wasm-isomap')
    const wasm_pack_options = [
        '--out-dir', wasm_pack_out_dir,
        rust_project_path
    ]

    await $`wasm-pack -v build ${wasm_pack_options}`
}


async function wasm_bindgen() {
    // CARGO BUILD

const cargo_toml_path = path.join(rust_project_path, 'Cargo.toml')

const cargo_options = [
    '--manifest-path', cargo_toml_path,
    '--target', 'wasm32-unknown-unknown',
]
await $`cargo build  ${cargo_options}`


// WASM-BINDGEN

const wasm_bindgen_wasm_path = 
    path.join( rust_project_path, 
                'target', 
                '/wasm32-unknown-unknown', 
                'release',
                'wasm_isomap.wasm')
// const wasm_binggen_out_path = path.join( 'modules', 'wasm-isomap')
const wasm_binggen_out_path = path.join( rust_project_path, 'pkg')

const wasm_bindgen_options = [
    wasm_bindgen_wasm_path,
    '--out-dir', wasm_binggen_out_path,
    '--target', 'web',
    '--reference-types',
    '--weak-refs'
]
await $`wasm-bindgen  ${wasm_bindgen_options}`
}