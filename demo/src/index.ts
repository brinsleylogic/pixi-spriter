import { Application } from "@pixi/app";
import { BatchRenderer, Renderer } from "@pixi/core";
import { ILoaderResource, Loader } from "@pixi/loaders";
import { SpritesheetLoader } from "@pixi/spritesheet";
import { TextureCache } from "@pixi/utils";
import SpriterCache from "pixi-spriter/pixi/SpriterCache";
import SconLoader from "pixi-spriter/pixi/SconLoader";
import DemoScene from "./DemoScene";

window.addEventListener("load", handleWindowLoaded);

function handleWindowLoaded(): void {
    Loader.registerPlugin(SconLoader);
    Loader.registerPlugin(SpritesheetLoader);
    Renderer.registerPlugin("batch", BatchRenderer);
    SpriterCache.setTextureCache(TextureCache);

    const app = new Application({
        backgroundColor: 0x222222,
        backgroundAlpha: 1,
        resizeTo: window,
    });

    document.body.appendChild(app.view);

    const loader = new Loader();
    loader.add("assets/test.scon");

    loader.load((_: Loader, resources: ILoaderResource) => {
        const scene = new DemoScene(
            resources["assets/test.scon"].data
        );

        app.stage.addChild(scene);

        let time = Date.now();

        const loop = () => {
            requestAnimationFrame(loop);

            const delta = Date.now() - time;
            time = Date.now();

            scene.update(delta);

            app.render();
        }

        loop();
    });
}