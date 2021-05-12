import { Container } from "@pixi/display";
import { Sprite } from "@pixi/sprite";
import Animator from "../animation/Animator";
import { IBoneState, ISpriteState } from "../animation/state/IAnimatorState";
import { IEntity } from "../file/ISpriterFile";
import SpriterCache from "./SpriterCache";

export default class SpriterContainer extends Container {
    private _animator: Animator;
    private _container: Container;
    private _bones: IBoneState[];
    private _sprites: Component[];

    /**
     * The Spriter Animator for this SpriterContainer.
     *
     * @readonly
     * @type {Animator}
     * @memberof SpriterContainer
     */
    public get animator(): Animator { return this._animator; }

    public constructor() {
        super();

        this._animator = new Animator();
    }

    /**
     *  Sets the Spriter Entity for this Animator to use.
     *
     * @param {IEntity} entity The Entity to use.
     * @returns {this}
     * @memberof SpriterContainer
     */
    public setEntity(entity: IEntity): this {
        this._animator.setEntity(entity);

        if (this._container) {
            this.removeChild(this._container);
            this._container.destroy({ children: true });
        }

        this._bones = [];
        this._sprites = [];

        this._container = new Container();
        this._container.setParent(this);

        return this;
    }

    /**
     * Plays the name with the supplied name.
     *
     * @param {string} name The name of the animation to play.
     * @returns {this}
     * @memberof SpriterContainer
     */
    public setAnimation(name: string): this {
        this._animator.play(name);
        this.update(0);

        return this;
    }

    /**
     * Updates the state of the SpriterContainer.
     *
     * @param {number} delta The update increment (in milliseconds).
     * @memberof SpriterContainer
     */
    public update(delta: number): void {
        if (!this._animator.playing) {
            return;
        }

        const state = this._animator.update(delta);

        this._bones = state.bones;

        for (let i = 1, l = state.bones.length; i < l; i++) {
            const bone = state.bones[i];

            this.applyParentProps(bone, state.bones[bone.parent]);
        }

        for (let i = 0, l = state.sprites.length; i < l; i++) {
            const data = state.sprites[i];

            let sprite = this._sprites[data.id];

            if (sprite == null) {
                sprite = new Component();
                sprite.setParent(this._container);
                this._sprites[data.id] = sprite;
            }

            this.applyState(sprite, data);
        }
    }

    /**
     * Applies the frame state to the supplied component.
     *
     * @private
     * @param {Component} component The component to update.
     * @param {ISpriteState} state The state to apply.
     * @memberof SpriterContainer
     */
    private applyState(component: Component, state: ISpriteState): void {
        this.applyParentProps(state, this._bones[state.parent]);

        component.spriter = state;
        component.position.set(state.x, state.y);
        component.scale.set(state.scale_x, state.scale_y);

        if (state.z_index != null) {
            component.zIndex = state.z_index;
        }

        if (state.angle != null) {
            component.rotation = this.toRadians(state.angle);
        }

        // Update the texture.
        if (state.file == null || state.folder == null) {
            return;
        }

        const fileData = SpriterCache.getFile(state.folder, state.file);

        if (fileData == null || component.name === fileData.name) {
            return;
        }

        component.texture = SpriterCache.getTexture(fileData.name);

        component.name = fileData.name;
        component.width = fileData.width;
        component.height = fileData.height;

        component.pivot.set(
            fileData.pivot_x * fileData.width,
            fileData.pivot_y * fileData.height
        );
    }

    /**
     * Applies the properties of the parent to the child transform.
     *
     * @private
     * @param {(IBoneState | ISpriteState)} child The child transform.
     * @param {IBoneState} parent The parent transform.
     * @memberof SpriterContainer
     */
    private applyParentProps(child: IBoneState | ISpriteState, parent: IBoneState): void {
        const x = child.x * parent.scale_x;
        const y = child.y * parent.scale_y;

        const parentAngle = this.toRadians(parent.angle);
        const sin = Math.sin(parentAngle);
        const cos = Math.cos(parentAngle);

        child.x = ((x * cos) - (y * sin)) + parent.x;
        child.y = ((x * sin) - (y * cos)) + parent.y;

        child.scale_x *= parent.scale_x;
        child.scale_y *= parent.scale_y;

        if (child.angle != null) {
            child.angle = Math.sign(parent.scale_x * parent.scale_y) * (child.angle + parent.angle) % 360;
        }
    }

    /**
     * Converts the supplied angle from degrees to Radians.
     *
     * @private
     * @param {number} degrees The angle to convert.
     * @returns {number}
     * @memberof SpriterContainer
     */
    private toRadians(degrees: number): number {
        return degrees * Math.PI / 180;
    }
}

class Component extends Sprite {
    public name: string;
    public spriter: ISpriteState;

    public get worldPos(): { x: number, y: number} {
        let { x, y } = { x: this.x, y: this.y };

        let parent: any = this.parent;

        while (parent) {
            x += parent.x;
            y += parent.y;

            parent = parent.parent;
        }

        return { x, y };
    }
}