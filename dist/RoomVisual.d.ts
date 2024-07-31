/// <reference types="screeps" />
export type Point = [number, number];
export interface RoomVisualOptions {
    color?: string;
    opacity?: number;
    textfont?: string;
    textsize?: number;
    textstyle?: string;
    textcolor?: string;
}
declare global {
    interface RoomVisual {
        roads: Point[];
        box(x: number, y: number, w: number, h: number, style?: LineStyle): RoomVisual;
        popupBox(info: string[], x: number, y: number, opts?: RoomVisualOptions): RoomVisual;
        multitext(textLines: string[], x: number, y: number, opts?: RoomVisualOptions): RoomVisual;
        structure(x: number, y: number, type: string, opts?: RoomVisualOptions): RoomVisual;
        connectRoads(opts?: RoomVisualOptions): RoomVisual | void;
        speech(text: string, x: number, y: number, opts?: RoomVisualOptions & {
            background?: string;
        }): RoomVisual;
        animatedMarker(x: number, y: number, opts?: RoomVisualOptions & {
            radius?: number;
            frames?: number;
        }): RoomVisual;
        resource(type: ResourceConstant, x: number, y: number, size?: number, opacity?: number): RoomVisual;
    }
}
