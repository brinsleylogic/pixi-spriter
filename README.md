# pixi-spriter

The `pixi-spriter` library provides a simple set of classes to (hopefully) make it easy to add animations exported from [Spriter Pro](https://brashmonkey.com/spriter-pro/) in your [pixi.js](https://www.pixijs.com/) projects!

## Features

This is currently a massive WIP - features are largely being developed in the order in which they're required for my own projects. Feel free to raise tickets for feature requests on the [issues](https://github.com/brinsleylogic/pixi-spriter/issues) page.

Prior to v1.0.0 this repo won't use semanyic versioning as I'd like to have everythign a bit more stable before producing a v1 release. Thereafter it will adhere to semantic versioning rules :)

### Loading

`pixi-spriter` provides a [Loader Plugin](https://pixijs.download/dev/docs/PIXI.html#ILoaderPlugin) for the `pixi.js` [resource-loader](https://pixijs.download/dev/docs/PIXI.Loader.html).

❌ Support for `.scml` files.

✔️ Support for `.scon` files.

✔️ Atlas (spritehseet) loading.

### Display

✔️ Spriter entity display component.

❌ Support for Character Maps.

### Playback

✔️ Play and set animations.

&nbsp;&nbsp;&nbsp;&nbsp;✔️ Smoothly blend animations.

✔️ Change playback speed.

&nbsp;&nbsp;&nbsp;&nbsp;✔️ Use negative speed values for reversed playback.

### Tags

Support for checking tags of animations/components is added through a set of functions in the [`TagChecker`](src/animator/TagChecker.ts) file. There aren't any convenience functions added to the display components so that if your project doesn't use the feature then the code won't be in your final bundle (assuming your bundler kaes use of tree-shaking).

### Variables

❌ TODO

### Colliders (Boxes)

❌ TODO

### Events (Action Points)

❌ TODO

### Audio Events

❌ TODO

## Performance

❌ Still need to benchmark and optimise.
