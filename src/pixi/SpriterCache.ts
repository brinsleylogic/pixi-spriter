import ISpriterFile, { IFile } from "../file/ISpriterFile";

/**
 * Static class for caching data related to Spriter files.
 *
 * @export
 * @class SpriterCache
 */
export default class SpriterCache {
    private static _fileCache: Record<string, IFile>;
    private static _defaultName: string;

    /**
     * Processes and chaches data from the file.
     *
     * @static
     * @param {string} name The name of the data.
     * @param {ISpriterFile} file The file to process.
     * @memberof SpriterCache
     */
    public static cache(name: string, file: ISpriterFile): void {
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


    private static getKey(name: string, folder: number, file: number): string {
        return `${name ?? this._defaultName}_${folder}_${file}`;
    }
}