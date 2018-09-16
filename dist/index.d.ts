import { IObjectWillChange } from "mobx";
export declare function interceptAsync(target: any, handler: (change: IObjectWillChange) => Promise<HandlerOutput>): void;
declare type HandlerOutput = IObjectWillChange | null;
export {};
