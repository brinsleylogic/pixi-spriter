import { Loader } from "@pixi/loaders";
import { Resource } from "resource-loader";
import parseScon from "../file/parseScon";
import SpriterCache from "./SpriterCache";

/**
 * Handles parsing of loaded .scon Spriter animation files.
 *
 * @class SconLoader
 */
class SconLoader {
    /**
     * Handles processing of loaded resource.
     *
     * @param {Resource} resource The loaded resource.
     * @param {(...args: any[]) => any} next
     * @memberof SconLoader
     */
    public static use(resource: Resource, next?: (...args: any[]) => void): void {
        if (!resource.data) {
            return next?.();
        }

        switch (resource.extension) {
            case "scon":
                break;

            case "json":
                // Spriter spritesheets have issues with boolean values being strings.
                if (resource.data?.meta?.app === "Spriter") {
                    SconLoader.processSpritesheetJson(resource.data.frames);
                }

                return next?.();

            default:
                return next?.();
        }

        if (resource.error) {
            return next?.(resource.error);
        }

        const data = resource.data = parseScon(resource.data, "pixi");

        SpriterCache.cache(resource.name, data);

        // Below here is just atlas loading.
        if (!data.atlas?.length) {
            return next?.();
        }

        const loader = this as any as Loader;

        const loaderOptions = {
            crossOrigin: resource.crossOrigin,
            parentResource: resource,
        };

        const atlasPath = resource.name.slice(0,
            resource.url
                .replace(loader.baseUrl, "")
                .lastIndexOf("/") + 1
        );

        // Check for loading spritesheets.
        data.atlas.forEach((atlas) => {
            const url = atlasPath + atlas.name;

            if (!loader.resources[url]) {
                loader.add(atlas.name, url, loaderOptions);
            }
        });

        next?.();
    }

    /**
     * Ensures Spriter json data is formatted correctly.
     *
     * @static
     * @param {*} data
     * @memberof SconLoader
     */
    public static processSpritesheetJson(data: any): void {
        Object.keys(data).forEach((key) => {
            const value = data[key];

            if (typeof value === "object") {
                this.processSpritesheetJson(value);
                return;
            }

            if (value === "false") {
                data[key] = false;
                return;
            }

            if (value === "true") {
                data[key] = true;
            }
        });
    }
}

export default SconLoader;
