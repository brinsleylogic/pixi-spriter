# pixi-spriter

The `pixi-spriter` library provides a simple set of classes to (hopefully) make it easy to add animations exported from [Spriter Pro](https://brashmonkey.com/spriter-pro/) in your [pixi.js](https://www.pixijs.com/) projects!

## Features

This is currently a massive WIP - features are largely being developed in the order in which they're required for my own projects. Feel free to raise tickets for feature requests on the [issues](https://github.com/brinsleylogic/pixi-spriter/issues) page.

Prior to v1.0.0 this repo won't use semanyic versioning as I'd like to have everythign a bit more stable before producing a v1 release. Thereafter it will adhere to semantic versioning rules :)

### Loading

`pixi-spriter` provides a [Loader Plugin](https://pixijs.download/dev/docs/PIXI.html#ILoaderPlugin) for the `pixi.js` [resource-loader](https://pixijs.download/dev/docs/PIXI.Loader.html).

- [x] Support for `.scon` files.
- [ ] Support for `.scml` files.
- [x] Atlas (spritehseet) loading.

### Display

- [x] Spriter entity display component.
- [ ] Support for Character Maps.

### Playback

- [x] Play and set animations.
  - [ ] Smoothly blend animations.
- [x] Change playback speed.
  - [x] Use negative speed values for reversed playback.
- [x] Timeline tags.
- [ ] Timeline variables.
- [ ] Timeline events.
- [ ] Timeline audio events.

## Performance

Still need to benchmark and optimise.