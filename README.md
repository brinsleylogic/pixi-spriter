# pixi-spriter

The `pixi-spriter` library provides a simple set of classes to (hopefully) make it easy to add animations exported from [Spriter Pro](https://brashmonkey.com/spriter-pro/) in your [pixi.js](https://www.pixijs.com/) projects!

This is currently a massive WIP - features are largely being developed in the order in which they're required for my own projects. Feel free to raise tickets for feature requests on the [issues](https://github.com/brinsleylogic/pixi-spriter/issues) page.

Prior to v1.0.0 this repo won't use semantic versioning as I'd like to have everything a bit more stable before producing a v1 release. Thereafter it will adhere to semantic versioning rules :)

# Features

## pixi.js integration

### Loading

`pixi-spriter` provides a [Loader Plugin](https://pixijs.download/dev/docs/PIXI.html#ILoaderPlugin) for the `pixi.js` [resource-loader](https://pixijs.download/dev/docs/PIXI.Loader.html).

❌  Support for `.scml` files.

✔️  Support for `.scon` files.

✔️  Atlas (spritehseet) loading.

✔️  Image loading.

### Display

✔️  Spriter entity display component.

❌  Support for Character Maps.

## Playback

✔️  Play and set animations.

&nbsp;&nbsp;&nbsp;&nbsp;✔️  Smoothly blend animations.

&nbsp;&nbsp;&nbsp;&nbsp;❌  Account for animation curves.

✔️ Change playback speed.

&nbsp;&nbsp;&nbsp;&nbsp;✔️ Use negative speed values for reversed playback.

## Tags

Support for checking [tags](https://brashmonkey.com/spriter_manual/adding%20tags%20to%20an%20animation.htm) of animations/components is added through a set of functions in the [`TagUtils`](src/animator/tags/TagUtils.ts) module. There aren't any convenience functions added to the display components so that if your project doesn't use the feature then the code won't be in your final bundle (assuming your bundler kaes use of tree-shaking).

The [`TagChecker`](src/animator/tags/TagChecker.ts) class provides some convenience methods and can be reused for querying different [`Animator`](src/animator/Animator.ts) instances.

## Variables

❌  TODO

## Action Points

[Action Points](https://brashmonkey.com/spriter_manual/adding%20spawning%20points%20to%20frames.htm) are managed by the [`Animator`](src/animator/Animator.ts) and are interpolated like the other timeline objects (bones, and sprites). They can be retrieved (when available) through the `Spriter.getPoint()` method.

## Colliders

Also known as [Collision Rectangles](https://brashmonkey.com/spriter_manual/adding%20collision%20rectangles%20to%20frames.htm) in Spriter, are also managed by the [`Animator`](src/animator/Animator.ts). Presently only point collisions are supported. Checking for collisions is done either calling [`checkCollisions`](src/animator/collision/checkCollision.ts), or through the conveience method on the [`Spriter`](src/pixi/Spriter.ts) class - which calls `checkCollisions` internall anyway.

When calling `checkCollisions` directly, the point supplied must be in the same co-ordinate space as the Animator being queried.
However, when using the `Spriter` method, the point suplpied needs to be in world (global) space; the method will handle the coordinate translation internally.

## Event Triggers

The [`Spriter`](src/pixi/Spriter.ts) class allows for checking whether an [event](https://brashmonkey.com/spriter_manual/adding%20event%20triggers%20to%20an%20animation.htm) was triggered on the latest call to `update()`. `isTriggered` will only return `true` for the first frame when the Event is active - even when playing animaitons at lower speeds. `Spriter` also has an event: `onEventTriggered` which will signal whenever an event is triggered.

```js
const anim = new Spriter();

// Listen for events triggering.
anim.onEventTriggered.add((event) => {
    console.log("Event triggered! Name:", event)
});

...

anim.update(deltaTime);

// Or check in an update loop.
if (anim.isTriggered("eventName")) {
    console.log("Event triggered just now: eventName");
}
```

## Audio Events

❌  TODO

## Performance

❌  Still need to benchmark and optimise.
