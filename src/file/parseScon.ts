import IParsedFile from "./IParsedFile";

/**
 * Parses the supplied Spriter file data and returns the result.
 *
 * @export
 * @param {string} jsonString The file data to process.
 * @returns {ISpriterFile}
 */
export default function parseScon(jsonString: string, engine?: string): IParsedFile {
    const data: IParsedFile = JSON.parse(jsonString, (key, value) => {
        if (value === "false") {
            return false;
        }

        if (value === "true") {
            return true;
        }

        if (key === "z_index") {
            return Number(value);
        }

        if (key === "timeline" && typeof value === "string") {
            return Number(value);
        }

        if (engine === "pixi") {
            switch (key) {
                case "y":
                case "scale_y":
                    return -value;

                case "pivot_y":
                    return 1 - value;

                case "angle":
                    value = -value;

                    if (value < -180) {
                        value += 360;
                    } else if (180 < value) {
                        value -= 360;
                    }

                    return value;


                default:
                    break;
            }
        }

        return value;
    });

    process(data);

    return data;
}

/**
 * Normalises data in to a consistent format.
 *
 * @param {IParsedFile} data The data to process.
 */
function process(data: IParsedFile): void {
    data.entity.forEach((entity) => {
        entity.animation.forEach((anim) => {
            // Animations loop by default.
            if (anim.looping == null) {
                anim.looping = true;
            }

            // Process timelines.

            const timelines = anim.timeline;

            timelines.forEach((timeline) => {
                if (timeline.meta == null) {
                    return;
                }

                // Process the tags for the timeline.
                const tagline = timeline.meta.tagline;

                if (tagline) {
                    const length = tagline.key.length;

                    tagline.key.forEach((line, index) => {
                        line.time ??= 0;

                        // Track the next frame.
                        if (anim.looping) {
                            line.next = tagline.key[(index + 1) % length];
                        } else if (index < length - 1) {
                            line.next = tagline.key[index + 1];
                        }

                        // Get tags in frame.
                        if (line.tag.length) {
                            line.tags = [];
                            line.tag.forEach((tag) => {
                                line.tags.push(data.tag_list[tag.t].name);
                            });
                        }

                        delete line.tag;
                    });
                }
            });

            // Process the objects in the main timeline.

            const keyFrames = anim.mainline.key;
            const length = keyFrames.length;

            keyFrames.forEach((frame, index) => {
                frame.animation = anim.id;
                frame.time ??= 0;

                // Track the next frame.
                if (anim.looping) {
                    frame.next = keyFrames[(index + 1) % length];
                } else if (index < length - 1) {
                    frame.next = keyFrames[index + 1];
                }

                // Update bones and objects with data from their timelines.

                frame.bone_ref.forEach((ref) => {
                    const timeline = anim.timeline[ref.timeline];
                    const bone = timeline.key[ref.key].bone;

                    bone.id = ref.id;
                    bone.name = ref.name = timeline.name;

                    bone.x ??= 0;
                    bone.y ??= 0;
                    bone.scale_x ??= 1;
                    bone.scale_y ??= 1;
                });

                frame.object_ref.forEach((ref) => {
                    const timeline = anim.timeline[ref.timeline];
                    const obj = timeline.key[ref.key].object;

                    obj.id = ref.id;
                    obj.z_index = ref.z_index;
                    obj.x ??= 0;
                    obj.y ??= 0;
                    obj.scale_x ??= 1;
                    obj.scale_y ??= 1;
                    obj.a ??= 1;

                    obj.name = ref.name = timeline.name;
                    obj.type = timeline.object_type;

                    if (timeline.obj == null) {
                        return;
                    }

                    const target: any = obj;
                    const info: any = entity.obj_info[timeline.obj];

                    if (obj.type === "box") {
                        target.w = info.w;
                        target.h = info.h;
                    }
                });
            })
        });
    });
}