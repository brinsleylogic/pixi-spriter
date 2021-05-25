import { Container } from "@pixi/display";
import Animator from "../animator/Animator";
import Event from "../animator/Event";
import { IEntity } from "../file/IParsedFile";
import SpriterComponent from "./SpriterComponent";
import ICollision from "../animator/collision/ICollision";
import checkCollision from "../animator/collision/checkCollision";

/**
 * The display component for a Spriter entity/animation.
 *
 * @export
 * @class Spriter
 * @extends {Container}
 */
export default class Spriter extends Container {
    /**
     * Invoked when an animation completes.
     *
     * @memberof Spriter
     */
    public readonly onComplete = new Event<(animation: string) => void>();

    /**
     * Invoked when an event is triggered.
     *
     * @memberof Spriter
     */
    public readonly onEventTrigger = new Event<(event: string) => void>();

    private readonly _animator: Animator;

    private _container: Container;
    private _components: SpriterComponent[];

    /**
     * The component responsible for managing playback and key-frame interpolation.
     *
     * @readonly
     * @type {Animator}
     * @memberof Spriter
     */
    public get animator(): Animator { return this._animator; }

    /**
     * The name of the current animation.
     *
     * @readonly
     * @type {string}
     * @memberof Spriter
     */
    public get animationName(): string { return this._animator?.animation?.name; }

    /**
     * The components of the Spriter entity.
     *
     * @readonly
     * @type {SpriterComponent[]}
     * @memberof Spriter
     */
    public get components(): SpriterComponent[] { return this._components; }

    /**
     * The playback speed fo the animation.
     *
     * @type {number}
     * @memberof Spriter
     */
    public get speed(): number { return this._animator.speed; }
    public set speed(value: number) { this._animator.speed = value; }

    public constructor() {
        super();

        this._animator = new Animator();
        this._animator.onComplete.add(() => {
            this.onComplete.dispatch(this._animator.animation.name);
        });
    }

    /**
     * Returns the named compoennt.
     *
     * @param {string} name The name of the desired component.
     * @returns {SpriterComponent}
     * @memberof Spriter
     */
    public getComponent(name: string): SpriterComponent;

    /**
     * Returns the component witht eh associated idenfifier.
     *
     * The `id` used here is the identifier fo the timeline, not the state.
     * This is due to the state's `id` being an indication of the array position which can change.
     *
     * @param {number} id The identifier fo the desired component.
     * @returns {SpriterComponent}
     * @memberof Spriter
     */
    public getComponent(id: number): SpriterComponent;

    public getComponent(id: string | number): SpriterComponent {
        let i = this._components.length;

        const isName = (typeof id === "string");

        while (i-- > 0) {
            if (this._components[i] == null) {
                continue;
            }

            if (isName) {
                if (id === this._components[i].name) {
                    return this._components[i];
                }
            } else if (id === this._components[i].id) {
                return this._components[i];
            }
        }
    }

    /**
     *  Sets the Spriter Entity for this Animator to use.
     *
     * @param {IEntity} entity The Entity to use.
     * @returns {this}
     * @memberof Spriter
     */
    public setEntity(entity: IEntity): this {
        this._animator.setEntity(entity);

        if (this._container) {
            this.removeChild(this._container);
            this._container.destroy({ children: true });
        }

        this._components = [];

        this._container = new Container();
        this._container.setParent(this);
        this._container.sortableChildren = true;

        return this;
    }

    /**
     * Plays the name with the supplied name.
     *
     * @param {string} name The name of the animation to play.
     * @returns {this}
     * @memberof Spriter
     */
    public setAnimation(name: string): this {
        this._animator.play(name);
        this.update(0);

        return this;
    }

    /**
     * Resumes a previously stopped animation.
     *
     * @returns {this}
     * @memberof Spriter
     */
    public play(): this;

    /**
     * Plays an animation.
     *
     * @param {string} animation The animation to play.
     * @param {number} [transitionTime] Time to smoothly transition the the supplied animation form the current animation.
     * @returns {this}
     * @memberof Spriter
     */
    public play(animation: string, transitionTime?: number): this;

    public play(animation?: string, time?: number): this {
        if (!animation) {
            this._animator.play();
        } else if (!time) {
            this._animator.play(animation);
        } else {
            this._animator.transition(animation, time);
        }

        return this;
    }

    /**
     * Stops the animation playback.
     *
     * @returns {this}
     * @memberof Spriter
     */
    public stop(): this {
        this._animator.stop();
        return this;
    }

    /**
     * Updates the state of the Spriter.
     *
     * @param {number} delta The update increment (in milliseconds).
     * @memberof Spriter
     */
    public update(delta: number): void {
        if (!this._animator.playing) {
            return;
        }

        const state = this._animator.update(delta);

        if (state == null) {
            return;
        }

        for (let i = 0, l = state.sprites.length; i < l; i++) {
            const data = state.sprites[i];

            let sprite = this._components[data.id];

            if (sprite == null) {
                sprite = new SpriterComponent();
                sprite.setParent(this._container);

                this._components[data.id] = sprite;
            }

            sprite.update(data);
        }

        if (state.events) {
            for (let i = 0, l = state.events.length; i < l; i++) {
                this.onEventTrigger.dispatch(state.events[i].name);
            }
        }
    }

    /**
     * Indicates whether named event was triggered in the latest call to `update()`.
     *
     * @param {string} eventName The name of the event.
     * @returns {boolean}
     * @memberof Spriter
     */
    public isTriggered(eventName: string): boolean {
        const triggered = this._animator?.state?.events;

        if (triggered == null) {
            return false;
        }

        let i = triggered.length;

        while (i-- > 0) {
            if (triggered[i].name === eventName) {
                return true;
            }
        }

        return false;
    }

    /**
     * Retrieves a Spiter Action Point from the current state.
     *
     * @param {string} name the name of the point to retrieve.
     * @returns {ISpriterPoint}
     * @memberof Spriter
     */
    public getPoint(name: string): ISpriterPoint {
        const points = this._animator.state?.points;

        if (!points || points.length === 0) {
            return;
        }

        let i = points.length;

        while (i-- > 0) {
            if (points[i].name === name) {
                return points[i];
            }
        }
    }

    /**
     * Checks whether the supplied point intersects with the Spriter Boxes of this @see Spriter instance.
     *
     * @param {number} x The position on the x-axis in world space.
     * @param {number} y The position on the y-axis in world space.
     * @returns {ICollision[]} The collision data for each intersected collider.
     * @memberof Spriter
     */
    public checkCollision(x: number, y: number): ICollision[] {
        const { x: lx, y: ly } = this.toLocal({ x, y });

        return checkCollision(this._animator, lx, ly);
    }
}

/**
 * Represents a Spriter Action Point.
 *
 * @interface ISpriterPoint
 */
interface ISpriterPoint {
    x: number;
    y: number;
    angle: number;
}