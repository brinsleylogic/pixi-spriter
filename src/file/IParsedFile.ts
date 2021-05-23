import ISpriterFile from "./ISpriterFile";
import {
    IAnimation as Animation,
    IBoneRef as BoneRef,
    IEntity as Entity,
    IEventline as Eventline,
    IMainlineKeyFrame as MainlineKeyFrame,
    IMetaData as MetaData,
    IObjectRef as ObjectRef,
    ITaglineKeyFrame as TaglineKeyFrame,
    ITimeline as Timeline,
    ITimelineBone as TimelineBone,
    ITimelineKeyFrame as TimelineKeyFrame,
    ITimelineObject as TimelineObject,
    IVallineKeyFrame as VallineKeyFrame,
}  from "./ISpriterFile";

/**
 * Represnets a parsed Spriter file.
 *
 * @export
 * @interface IParsedFile
 * @extends {ISpriterFile}
 */
export default interface IParsedFile extends ISpriterFile {
    entity: IEntity[];
}

export interface IEntity extends Entity {
    animation: IAnimation[];
}

export interface IAnimation extends Animation {
    eventline?: IEventline[];

    mainline: {
        key: IMainlineKeyFrame[];
    };

    timeline: ITimeline[];

    meta?: IMetaData;
}

export interface IMainlineKeyFrame extends MainlineKeyFrame {
    animation: number;

    bone_ref: IBoneRef[];

    object_ref: IObjectRef[];

    next?: IMainlineKeyFrame;
}

export interface IBoneRef extends BoneRef {
    name: string;
}

export interface IObjectRef extends ObjectRef {
    name: string;
}

export interface ITimeline extends Timeline {
    key: ITimelineKeyFrame[];
    meta?: IMetaData;
}

export interface ITimelineKeyFrame extends TimelineKeyFrame {
    object?: ITimelineObject;
    bone?: ITimelineBone;
}

export interface ITimelineBone extends TimelineBone {
    id: number;
    name: string;
}

export interface ITimelineObject extends TimelineObject {
    id: number;
    name: string;
    type: string;
}

export interface IMetaData extends MetaData {
    tagline?: {
        key: ITaglineKeyFrame[];
    };

    valline?: {
        id: number;
        def: number;
        key: IVallineKeyFrame[];
    }[];
}

export interface IEventline extends Eventline {
    meta?: IMetaData;
}

export interface ITaglineKeyFrame extends TaglineKeyFrame {
    tags: string[];

    next?: ITaglineKeyFrame;
}

export interface IVallineKeyFrame extends VallineKeyFrame {
    next?: IVallineKeyFrame;
}