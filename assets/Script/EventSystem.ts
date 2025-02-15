export class EventSystem {
    private static _instance: EventSystem;
    private events: { [key: string]: Function[] } = {};

    private constructor() {}

    public static get instance(): EventSystem {
        if (!this._instance) {
            this._instance = new EventSystem();
        }
        return this._instance;
    }

    public on(event: string, listener: Function) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    public off(event: string, listener: Function) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(l => l !== listener);
    }

    public emit(event: string, ...args: any[]) {
        if (!this.events[event]) return;
        this.events[event].forEach(listener => listener(...args));
    }
}