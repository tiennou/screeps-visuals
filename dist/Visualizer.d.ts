/// <reference types="screeps" />
import { RoomVisualOptions } from "./RoomVisual";
export interface Coord {
    x: number;
    y: number;
}
export interface StructureLayout {
    [rcl: number]: {
        buildings: {
            [structureType: string]: {
                pos: Coord[];
            };
        };
    };
    data: {
        anchor: Coord;
    };
}
export interface StructureMap {
    [structureType: string]: RoomPosition[];
}
/**
 * The Visualizer contains many static methods for drawing room visuals and displaying information through a GUI
 */
export declare class Visualizer {
    private static textStyle;
    static drawStructureMap(structureMap: StructureMap): void;
    static drawLayout(layout: StructureLayout, anchor: RoomPosition, opts?: {}): void;
    static drawRoads(positions: RoomPosition[], opts?: RoomVisualOptions): void;
    static drawPath(path: RoomPosition[], style?: PolyStyle): void;
    static displayCostMatrix(matrix: CostMatrix, roomName?: string, opts?: {
        dots: boolean;
        displayZero: boolean;
    }): void;
    static popupBox(info: string[], calledFrom: {
        room: Room | undefined;
        pos: RoomPosition;
    }, opts?: {}): RoomVisual;
    static section(title: string, pos: {
        x: number;
        y: number;
        roomName?: string;
    }, width: number, height: number): {
        x: number;
        y: number;
    };
    static infoBox(header: string, content: string[] | string[][], pos: {
        x: number;
        y: number;
        roomName?: string;
    }, width: number): number;
    static barGraph(progress: number | [number, number], pos: {
        x: number;
        y: number;
        roomName?: string;
    }, width?: number, scale?: number, fmt?: (num: number) => string): void;
    static table(data: string[][], pos: {
        x: number;
        y: number;
        roomName?: string;
    }): void;
    static multitext(lines: string[], pos: {
        x: number;
        y: number;
        roomName?: string;
    }): void;
}
declare global {
    interface CostMatrix {
        _bits: Uint8Array;
    }
}
