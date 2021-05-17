import { Texture } from "@pixi/core";
import { IFile } from "../file/ISpriterFile";
import IParsedFile from "../file/IParsedFile";

/**
 * Static class for caching data related to Spriter files.
 *
 * @export
 * @class SpriterCache
 */
export default class SpriterCache {
    private static _fileCache: Record<string, IFile>;
    private static _textureCache: Record<string, Texture>;
    private static _defaultName: string;

    /**
     * Sets the objecty to use to retrieve textures from.
     *
     * @static
     * @param {Record<string, Texture>} textureCache The texture lookup object.
     * @memberof SpriterCache
     */
    public static setTextureCache(textureCache: Record<string, Texture>): void {
        this._textureCache = textureCache;
    }

    /**
     * Processes and chaches data from the file.
     *
     * @static
     * @param {string} name The name of the data.
     * @param {ISpriterFile} file The file to process.
     * @memberof SpriterCache
     */
    public static cache(name: string, file: IParsedFile): void {
        this._fileCache ??= {};
        this._defaultName ??= name;

        file.folder.forEach((folder) => {
            folder.file.forEach((file) => {
                this._fileCache[this.getKey(name, folder.id, file.id)] = file;
            });
        });
    }

    /**
     * Retrieves a file definition from the cache.
     *
     * @static
     * @param {number} folderId The folder identifier.
     * @param {number} fileId The file identifier.
     * @param {string} [name] The name supplied to the cache for the desired data (loaded asset name if added by SconLoader).
     * @returns {IFile}
     * @memberof SpriterCache
     */
    public static getFile(folderId: number, fileId: number, name?: string): IFile {
        return this._fileCache?.[this.getKey(name, folderId, fileId)];
    }

    public static getTexture(name: string): Texture;

    public static getTexture(folderId: number, fileId: number): Texture;

    public static getTexture(arg: number | string, fileId?: number): Texture {
        const name = (typeof arg === "string")
            ? arg
            : this.getFile(arg, fileId).name;

        return this._textureCache[name];
    }

    /**
     * Generates a unique key based on the proprties supplied.
     *
     * @private
     * @static
     * @param {string} name
     * @param {number} folder
     * @param {number} file
     * @returns {string}
     * @memberof SpriterCache
     */
    private static getKey(name: string, folder: number, file: number): string {
        return `${name ?? this._defaultName}_${folder}_${file}`;
    }
}