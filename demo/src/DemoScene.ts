import { Container } from "@pixi/display";
import { Renderer, Texture } from "@pixi/core";
import { Sprite } from "@pixi/sprite";
import { Text } from "@pixi/text";
import IParsedFile from "pixi-spriter/file/IParsedFile";
import Spriter from "pixi-spriter/pixi/Spriter";
import wrap from "pixi-spriter/utils/wrap";

export default class DemoScene extends Container {
    private readonly _data: IParsedFile;
    private readonly _container: Container;
    private readonly _fps: FpsCounter;

    private _animations: Spriter[];
    private _changeTimer: number;

    public constructor(data: IParsedFile) {
        super();

        this._data = data;
        this._changeTimer = 0;

        this._container = new Container();
        this._container.setParent(this);

        this._fps = new FpsCounter();
        this._fps.setParent(this);

        this._animations = [];

        for (let i = 0; i < 1; i++) {
            const anim = this.createAnim(
                "idle",
                window.innerWidth * 0.5,
                window.innerHeight * 0.5
            );

            const spr = new Sprite();
            spr.setParent(anim);
            spr.anchor.set(0.5, 0.5);
            spr.texture = Texture.WHITE;
            spr.tint = 0x00ff00;
        }
    }

    public update(delta: number): void {
        this._animations.forEach((anim) => anim.update(delta));

        this._changeTimer = wrap(this._changeTimer + delta, 0, 12000);

        if (this._changeTimer < delta) {
            this._animations.forEach((anim) => {
                anim.play(
                    (anim.animationName === "walk")
                     ? "idle"
                     : "walk"
                    , 1000);
            });
        }
    }

    public createAnim(anim: string, x: number, y: number): Spriter {
        const spriter = new Spriter();
        spriter.setParent(this);

        spriter.setEntity(this._data.entity[0])
            .setAnimation(anim)
            .position.set(x, y);

        this._animations.push(spriter);

        return spriter;
    }
}

class FpsCounter extends Text {
    private _history: number[];
    private _lastTime: number;

    public constructor() {
        super("0", {
            fontSize: 24,
            fill: 0x0099ff,
            fontWeight: "400",
        });

        this._history = [];
        this._lastTime = Date.now();
    }

    public render(renderer: Renderer): void {
        this.updateFps();
        super.render(renderer);
    }

    private updateFps(): void {
        const now = Date.now();
        const count = 1000 / (now - this._lastTime);

        if (count === 0) {
            return;
        }

        this._lastTime = now;

        // Drop oldest frame.
        if (this._history.length === 100) {
            this._history.splice(0, 1);
        }

        // Add new frame.
        this._history.push(count);

        const avg = this._history.reduce((acc, count) => acc + count, 0) / this._history.length;

        this.text = avg.toFixed(1).replace(".0", "");
    }
}