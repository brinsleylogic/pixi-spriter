/**
 * Manages a list of methods that are invoked when dispatch() is called.
 *
 * @export
 * @class Event
 */
export default class Event<T extends IEventListener = IEventListener> {
    private _listeners: IRegisteredListener<T>[];
    private _removeAfterDispatch: IRegisteredListener<T>[];
    private _dispatching: boolean;

    public constructor() {
        this._listeners = [];
    }

    /**
     * Provides an route to use await-async method.
     *
     * @returns {Promise<any>}
     * @memberof Event
     */
    public async await<U>(): Promise<U> {
        return new Promise<any>((resolve) => {
            this.addOnce(<T>resolve);
        });
    }

    /**
     * Adds an event listener to this Event.
     *
     * @param {T} listener The method to register.
     * @returns {this}
     * @memberof Event
     */
    public add(listener: T): this;

    /**
     * Adds an event listener to this Event.
     *
     * @param {T} listener The method to register.
     * @param {*} context The context used to invoke the listener.
     * @returns {this}
     * @memberof Event
     */
    public add(listener: T, context: any): this;

    /**
     * Adds an Event to be dispatched when this one dispatches.
     *
     * @param {Event<T>} event The Event to register.
     * @returns {this}
     * @memberof Event
     */
    public add(event: Event<T>): this;

    public add(arg: T | Event<T>, context?: any): this {
        let listener: any;

        if (arg instanceof Event) {
            listener = arg.dispatch;
            context = arg;
        } else {
            listener = arg;
        }

        this._listeners.push({ listener, context });

        return this;
    }

    /**
     * Adds an event listener to this Event to be invoked only once.
     *
     * @param {T} listener The method to register.
     * @returns {this}
     * @memberof Event
     */
    public addOnce(listener: T): this;

    /**
     * Adds an event listener to this Event to be invoked only once.
     *
     * @param {T} listener The method to register.
     * @param {*} context The context used to invoke the listener.
     * @returns {this}
     * @memberof Event
     */
    public addOnce(listener: T, context: any): this;

    /**
     * Adds an Event to be dispatched when this one dispatches, only once.
     *
     * @param {Event<T>} event The Event to register.
     * @returns {this}
     * @memberof Event
     */
    public addOnce(event: Event<T>): this;

    public addOnce(arg: T | Event<T>, context?: any): this {
        let listener: any;

        if (arg instanceof Event) {
            listener = arg.dispatch;
            context = arg;
        } else {
            listener = arg;
        }

        this._listeners.push({ listener, context, remove: true });

        return this;
    }

    /**
     * Removes an event listener from this Event.
     *
     * @param {T} listener The method to deregister.
     * @returns {this}
     * @memberof Event
     */
    public remove(listener: T): this;

    /**
     * Removes an event listener from this Event.
     *
     * @param {T} listener The method to deregister.
     * @param {*} context The context used to invoke the listener.
     * @returns {this}
     * @memberof Event
     */
    public remove(listener: T, context: any): this;

    /**
     * Removes an Event from being dispatched when this one dispatches.
     *
     * @param {Event<T>} event The Event to deregister.
     * @returns {this}
     * @memberof Event
     */
    public remove(event: Event<T>): this;

    public remove(arg: T | Event<T>, context?: any): this {
        let listener: any;

        if (arg instanceof Event) {
            listener = arg.dispatch;
            context = arg;
        } else {
            listener = arg;
        }

        let i = this._listeners.length;

        while (i-- > 0) {
            const data = this._listeners[i];

            if (data.listener === listener && data.context === context) {
                if (this._dispatching) {
                    if (this._removeAfterDispatch) {
                        this._removeAfterDispatch.push(data);
                    } else {
                        this._removeAfterDispatch = [data];
                    }
                } else {
                    this._listeners.splice(i, 1);
                }

                return this;
            }
        }

        return this;
    }

    /**
     * Removes all registered listeners.
     *
     * @memberof Event
     */
    public removeAll(): void {
        if (this._dispatching) {
            this._removeAfterDispatch = [];
        } else {
            this._listeners.splice(0, this._listeners.length);
        }
    }

    /**
     * Invoked registered listener functions, passing the supplied arguments.
     *
     * @param {...any[]} args Arguments to provide listener functions.
     * @memberof Event
     */
    public dispatch(...args: any[]): void {
        this._dispatching = true;

        for (let i = 0, l = this._listeners.length; i < l; i++) {
            const data = this._listeners[i];

            if (this._removeAfterDispatch != null) {
                if (this._removeAfterDispatch.length === 0) {
                    break;
                }

                if (this._removeAfterDispatch.indexOf(data) > -1) {
                    continue;
                }
            }

            if (data.remove) {
                if (this._removeAfterDispatch == null) {
                    this._removeAfterDispatch = [data];
                } else if (this._removeAfterDispatch.length > 0) {
                    this._removeAfterDispatch.push(data);
                }
            }

            switch (args.length) {
                case 0:
                    data.listener.call(data.context);
                    break;

                case 1:
                    data.listener.call(data.context, args[0]);
                    break;

                case 2:
                    data.listener.call(data.context, args[0], args[1]);
                    break;

                case 3:
                    data.listener.call(data.context, args[0], args[1], args[2]);
                    break;

                case 4:
                    data.listener.call(data.context, args[0], args[1], args[2], args[3]);
                    break;

                case 5:
                    data.listener.call(data.context, args[0], args[1], args[2], args[3], args[4]);
                    break;

                default:
                    data.listener.apply(data.context, args);
                    break;
            }
        }

        this._dispatching = false;

        if (this._removeAfterDispatch == null) {
            return;
        }

        const removalList = this._removeAfterDispatch;

        this._removeAfterDispatch = undefined;

        let i = removalList.length;

        if (i === 0) {
            this.removeAll();
            return;
        }

        while (i-- > 0) {
            const data = removalList[i];
            const index = this._listeners.indexOf(data);

            this._listeners.splice(index, 1);
        }
    }
}

/**
 * Defines a registered listener function.
 *
 * @interface IRegisteredListener
 */
interface IRegisteredListener<T extends IEventListener = IEventListener> {
    /**
     * The function to invoke.
     *
     * @type {IEventListener}
     * @memberof IRegisteredListener
     */
    listener: T;

    /**
     * the context for invoking the listener function.
     *
     * @type {*}
     * @memberof IRegisteredListener
     */
    context: any;

    /**
     * Indicates whether the listener should be removed when invoked.
     *
     * @type {boolean}
     * @memberof IRegisteredListener
     */
    remove?: boolean;
}

/**
 * Defines a function registered to an Event.
 *
 * @interface IEventListener
 */
interface IEventListener {
    (...args: any[]): any;
}