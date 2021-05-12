/**
 * Describes the structure of a Spriter file.
 *
 * @export
 * @interface ISpriterFile
 */
export default interface ISpriterFile {
    /**
     * The altases packages with Spriter along side this definition file.
     *
     * @type {IAtlas[]}
     * @memberof ISpriterFile
     */
    atlas: IAtlas[];

    /**
     * The Spriter entities (a collection of animations with shared textures).
     *
     * @type {IEntity[]}
     * @memberof ISpriterFile
     */
    entity: IEntity[];

    /**
     * A mapping of the resources referenced in Spriter.
     *
     * @type {IFolder[]}
     * @memberof ISpriterFile
     */
    folder: IFolder[];

    /**
     * Name of the generator used to build the scon file.
     *
     * @type {string}
     * @memberof ISpriterFile
     */
    generator: string;

    /**
     * The version of the `generator` software.
     *
     * @type {string}
     * @memberof ISpriterFile
     */
    generator_version: string;

    /**
     * The scon format version.
     *
     * @type {string}
     * @memberof ISpriterFile
     */
    scon_version: string;

    tag_list: {
        id: number;
        name: string;
    }[];
}

/**
 * Desacribes a Spriter Atlas element.
 *
 * @interface IAtlas
 */
interface IAtlas {
    /**
     * The name of the atlas file.
     *
     * @type {string}
     * @memberof IAtlas
     */
    name: string;
}

/**
 * Describes a Spriter file's Folder element.
 *
 * @interface IFolder
 */
interface IFolder {
    id: number;
    name: string;
    atlas: number;
    file: IFile[];
}

/**
 * Represents an asset used by the Spriter entity/animation.
 *
 * @interface IFile
 */
export interface IFile {
    id: number;
    name: string;
    width: number;
    height: number;
    pivot_x: number;
    pivot_y: number;
}

/**
 * Represents the data structure stored in the Spriter scon file for an entity.
 *
 * @interface IEntity
 */
export interface IEntity {
    /**
     * The ID of the entity.
     *
     * @type {number}
     * @memberof IEntity
     */
    id: number;

    /**
     * The name of the entity.
     *
     * @type {string}
     * @memberof IEntity
     */
    name: string;

    /**
     * An array of data for the different animations for this entity.
     *
     * @type {IAnimation[]}
     * @memberof IEntity
     */
    animation: IAnimation[];

    /**
     * Provides information about the components used.
     *
     * @type {(IObjectInfo | IBoneInfo)[]}
     * @memberof IEntity
     */
    obj_info: (IObjectInfo | IBoneInfo)[];

    // TODO : Figure this out.
    character_map: ICharacterMap[];
}

export interface IObjectInfo {
    type: "sprite";
    name: string;

    frames: {
        file: number;
        folder: number;
    }[];
}

export interface IBoneInfo {
    type: "bone";
    name: string;

    w: number;
    h: number,
}

interface ICharacterMap {
    id: number;
    name: string;

    maps: {
        folder: number;
        file: number;
        target_folder: number;
        target_file: number;
    }[];
}

/**
 * Represents the data structure describing a Spriter animation.
 *
 * @interface IAnimation
 */
export interface IAnimation {
    /**
     * The identifier of the animation.
     *
     * @type {number}
     * @memberof IAnimation
     */
    id: number;

    /**
     * The name of the animation.
     *
     * @type {string}
     * @memberof IAnimation
     */
    name: string;

    /**
     * Duration fo the animation.
     *
     * @type {number}
     * @memberof IAnimation
     */
    length: number;

    /**
     * The snapping interval for the keyframes.
     *
     * @type {number}
     * @memberof IAnimation
     */
    interval: number;

    /**
     * Indicates whether this animation is set to repeat.
     *
     * @type {boolean}
     * @memberof IAnimation
     */
    looping: boolean;

    /**
     * The main animation timeline.
     *
     * @type {IMainline}
     * @memberof IAnimation
     */
    mainline: {
        key: IMainlineKeyFrame[];
    };

    /**
     * The object animation timeline.
     *
     * @type {ITimeline[]}
     * @memberof IAnimation
     */
    timeline: ITimeline[];

    eventline?: any[];
    soundline?: any[];
}

/**
 * Describes the structure of the timeline for animated objects.
 *
 * @interface ITimeline
 */
interface ITimeline {
    id: number;
    name: string;
    key: ITimelineKeyFrame[];
}

/**
 * Describes the structure of a keyframe on the main timeline.
 *
 * @interface IMainlineKeyFrame
 */
export interface IMainlineKeyFrame {
    /**
     * The ID of this keyframe.
     *
     * @type {number}
     * @memberof IMainlineKeyFrame
     */
    id: number;

    /**
     * The timestamp for this keyframe.
     *
     * @type {number}
     * @memberof IMainlineKeyFrame
     */
    time: number;

    /**
     * Reference data for all of the bones in the animation.
     *
     * @type {IBoneRef[]}
     * @memberof IMainlineKeyFrame
     */
    bone_ref: IBoneRef[];

    /**
     * Reference data for all of the objects in the animation.
     *
     * @type {IObjectRef[]}
     * @memberof IMainlineKeyFrame
     */
    object_ref: IObjectRef[];
}

/**
 * A reference to a bone in the Entity.
 *
 * @export
 * @interface IBoneRef
 */
export interface IBoneRef {
    id: number;
    key: number;
    timeline: number;
    parent: number;
}

/**
 * A reference to a object in the Entity.
 *
 * @export
 * @interface IBoneRef
 */
export interface IObjectRef {
    id: number;
    key: number;
    parent: number;
    timeline: number;
    z_index: number;
}

/**
 * Describes the structure of a keyframe on the object timeline.
 *
 * @interface ITimelineKeyFrame
 */
export interface ITimelineKeyFrame {
    /**
     * The ID of this keyframe.
     *
     * @type {number}
     * @memberof ITimelineKeyFrame
     */
    id: number;

    /**
     * Spin direction.
     * 0 = none
     * 1 = clockwise
     * 2 = anticlockwise
     *
     * @type {number}
     * @memberof ITimelineKeyFrame
     */
    spin: number;

    /**
     * The timestamp for this keyframe.
     *
     * @type {number}
     * @memberof ITimelineKeyFrame
     */
    time: number;

    /**
     * The target properties for this keyframe.
     *
     * @type {IObjectState}
     * @memberof ITimelineKeyFrame
     */
    object?: IObjectState;

    /**
     * The target properties for this keyframe.
     *
     * @type {IBoneState}
     * @memberof ITimelineKeyFrame
     */
    bone?: IBoneState;
}

export interface IBoneState {
    angle: number;
    scale_x: number;
    scale_y: number;
    x: number;
    y: number;

    // Injected when file is parsed.
    id: number;
}

export interface IObjectState {
    angle: number;
    file: number;
    folder: number;
    scale_x: number;
    scale_y: number;
    x: number;
    y: number;
    a: number;

    // Injected when file is parsed.
    id: number;
    z_index: number;
}