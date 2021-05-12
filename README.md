# pixi-spriter

The `pixi-spriter` library provides a simple set of classes to (hopefully) make it easy to add animations exported from [Spriter Pro](https://brashmonkey.com/spriter-pro/) in you [pixi.js](https://www.pixijs.com/) projects!

## Features

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
  - [ ] Allow for negative speed values (reversed playback).
- [ ] Timeline tags.
- [ ] Timeline variables.
- [ ] Timeline triggers.
- [ ] Timeline audio events.

## Performance

Still need to benchmark and optimise.