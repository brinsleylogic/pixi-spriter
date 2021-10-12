import { Loader, TextureLoader } from "@pixi/loaders";
import { Resource } from "resource-loader";
import parseScon from "../file/parseScon";
import SpriterCache from "./SpriterCache";
import { IFolder } from "../file/ISpriterFile";

/**
 * Handles parsing of loaded .scon Spriter animation files.
 *
 * @class SconLoader
 */
class SconLoader {
    /**
     * Indicates whether all assets listed n the scon file (folders and files) should be loaded automatically.
     *
     * @static
     * @type {boolean}
     * @memberof SconLoader
     */
    /**
     * A list of folders to load automativcally load assets from.
     *
     * @static
     * @type {boolean}
     * @memberof SconLoader
     */
    public static loadAllAssets: boolean | string[] = false;

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

        // Set up loading additonal files.
        const loader = this as any as Loader;
        const basePath = resource.name.slice(0,
            resource.url
                .replace(loader.baseUrl, "")
                .lastIndexOf("/") + 1
        );

        const loaderOptions = {
            crossOrigin: resource.crossOrigin,
            parentResource: resource,
        };

        // Check for loading spritesheets.
        if (data.atlas?.length) {
            data.atlas.forEach((atlas) => {
                const url = basePath + atlas.name;

                if (!loader.resources[url]) {
                    loader.add(atlas.name, url, loaderOptions);
                }
            });
        }

        // Check for loading assets from scon's folder structure.
        else if (SconLoader.loadAllAssets) {
            data.folder.forEach((folder) => {
                if (!SconLoader.shouldLoadFolder(folder)) {
                    return;
                }

                folder.file.forEach((file) => {
                    const url = basePath + file.name;

                    if (!loader.resources[url]) {
                        loader.add(file.name, url, loaderOptions);
                    }
                });
            });
        }

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
                SconLoader.processSpritesheetJson(value);
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

    /**
     * Indicates whether assets in the supplied folder should be loaded.
     *
     * @private
     * @static
     * @param {IFolder} folder the folder to check.
     * @returns {boolean}
     * @memberof SconLoader
     */
    private static shouldLoadFolder(folder: IFolder): boolean {
        if (typeof SconLoader.loadAllAssets === "boolean") {
            return SconLoader.loadAllAssets;
        }

        if (SconLoader.loadAllAssets.indexOf(folder.name) > -1) {
            return true;
        }

        return false;
    }
}

export default SconLoader;
