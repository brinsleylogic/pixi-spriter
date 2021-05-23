import { Sprite } from "@pixi/sprite";
import { IObjectState } from "../animator/IAnimatorState";
import SpriterCache from "./SpriterCache";

/**
 * Display component for a @see Spriter instance.
 *
 * @class SpriterComponent
 * @extends {Sprite}
 */
export default class SpriterComponent extends Sprite {
    private _id: number;
    private _name: string;

    /**
     * The unique identifier of the component.
     *
     * The `id` used here is the identifier fo the timeline, not the state.
     * This is due to the state's `id` being an indication of the array position which can change.
     *
     * @type {string}
     * @memberof SpriterComponent
     */
    public get id(): number { return this._id; }

    /**
     * The name of the component.
     *
     * @type {string}
     * @memberof SpriterComponent
     */
    public get name(): string { return this._name; }

    /**
     * Sets the state of the component from the supplied data.
     *
     * @param {IObjectState} state The data used to update the component's state.
     * @returns {void}
     * @memberof SpriterComponent
     */
    public update(state: IObjectState): void {
        this._id = state.timeline;
        this._name = state.name;

        this.position.set(state.x, state.y);
        this.scale.set(state.scale_x, state.scale_y);

        if (state.z_index != null) {
            this.zIndex = state.z_index;
        }

        if (state.angle != null) {
            this.angle = state.angle;
        }

        // Update the texture.
        if (state.file == null || state.folder == null) {
            return;
        }

        const fileData = SpriterCache.getFile(state.folder, state.file);

        if (fileData == null || this.name === fileData.name) {
            return;
        }

        this.texture = SpriterCache.getTexture(fileData.name);

        this.width = fileData.width;
        this.height = fileData.height;

        this.pivot.set(
            fileData.pivot_x * fileData.width,
            fileData.pivot_y * fileData.height
        );
    }
}