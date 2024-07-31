import { RoomVisualOptions } from "./RoomVisual";

const TEXT_COLOR = "#c9c9c9";
const TEXT_SIZE = 0.8;
const CHAR_WIDTH = TEXT_SIZE * 0.4;
const CHAR_HEIGHT = TEXT_SIZE * 0.9;

export interface Coord {
	x: number;
	y: number;
}

export interface StructureLayout {
	[rcl: number]: {
		buildings: { [structureType: string]: { pos: Coord[] } };
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
export class Visualizer {
	private static textStyle(size = 1, style: TextStyle = {}) {
		return _.defaults(style, {
			color: TEXT_COLOR,
			align: "left",
			font: `${size * TEXT_SIZE} Trebuchet MS`,
			opacity: 0.8,
		});
	}

	static drawStructureMap(structureMap: StructureMap): void {
		const vis: { [roomName: string]: RoomVisual } = {};
		for (const structureType in structureMap) {
			for (const pos of structureMap[structureType]) {
				if (!vis[pos.roomName]) {
					vis[pos.roomName] = new RoomVisual(pos.roomName);
				}
				vis[pos.roomName].structure(pos.x, pos.y, structureType);
			}
		}
		for (const roomName in vis) {
			vis[roomName].connectRoads();
		}
	}

	static drawLayout(
		layout: StructureLayout,
		anchor: RoomPosition,
		opts = {}
	): void {
		_.defaults(opts, { opacity: 0.5 });
		const vis = new RoomVisual(anchor.roomName);
		for (const structureType in layout[8]!.buildings) {
			for (const pos of layout[8]!.buildings[structureType].pos) {
				const dx = pos.x - layout.data.anchor.x;
				const dy = pos.y - layout.data.anchor.y;
				vis.structure(
					anchor.x + dx,
					anchor.y + dy,
					structureType,
					opts
				);
			}
		}
		vis.connectRoads(opts);
	}

	static drawRoads(
		positions: RoomPosition[],
		opts?: RoomVisualOptions
	): void {
		const pointsByRoom = _.groupBy(positions, (pos) => pos.roomName);
		for (const roomName in pointsByRoom) {
			const vis = new RoomVisual(roomName);
			for (const pos of pointsByRoom[roomName]) {
				vis.structure(pos.x, pos.y, STRUCTURE_ROAD, opts);
			}
			vis.connectRoads(opts);
		}
	}

	static drawPath(path: RoomPosition[], style?: PolyStyle): void {
		for (let i = 0; i < path.length; i++) {
			const nextPos = path[i + 1];
			if (!nextPos) {
				break;
			}
			const pos = path[i];
			if (nextPos.roomName !== pos.roomName) {
				continue;
			}

			new RoomVisual(pos.roomName).line(pos, nextPos, {
				color: style?.fill,
				opacity: style?.opacity ?? 0.2,
				lineStyle: style?.lineStyle ?? "dashed",
			});
		}
	}

	static displayCostMatrix(
		matrix: CostMatrix,
		roomName?: string,
		opts = { dots: true, displayZero: true }
	): void {
		opts = _.defaults(opts, { dots: true, displayZero: true });

		const vis = new RoomVisual(roomName);
		let x, y, cost, percentOfMax: number;
		let color: string;

		const maxVal = getMaxValue(matrix) + 1;

		if (opts.dots) {
			for (y = 0; y < 50; ++y) {
				for (x = 0; x < 50; ++x) {
					cost = matrix.get(x, y);
					if (cost > 0) {
						percentOfMax = Math.round((255 * cost) / maxVal);
						color = rgbToHex(
							255,
							255 - percentOfMax,
							255 - percentOfMax
						);
						vis.circle(x, y, {
							radius: matrix.get(x, y) / maxVal / 2,
							fill: color,
						});
					}
				}
			}
		} else {
			for (y = 0; y < 50; ++y) {
				for (x = 0; x < 50; ++x) {
					cost = matrix.get(x, y);
					if (opts.displayZero || cost != 0) {
						percentOfMax = Math.round((255 * cost) / maxVal);
						color = rgbToHex(
							255,
							255 - percentOfMax,
							255 - percentOfMax
						);
						vis.text(
							matrix.get(x, y).toString(16).toUpperCase(),
							x,
							y + 0.3,
							{ color: color }
						);
					}
				}
			}
		}
	}

	static popupBox(
		info: string[],
		calledFrom: { room: Room | undefined; pos: RoomPosition },
		opts = {}
	): RoomVisual {
		if (calledFrom.room) {
			return calledFrom.room.visual.popupBox(
				info,
				calledFrom.pos.x,
				calledFrom.pos.y,
				opts
			);
		} else {
			return new RoomVisual(calledFrom.pos.roomName).popupBox(
				info,
				calledFrom.pos.x,
				calledFrom.pos.y,
				opts
			);
		}
	}

	static section(
		title: string,
		pos: { x: number; y: number; roomName?: string },
		width: number,
		height: number
	): { x: number; y: number } {
		const vis = new RoomVisual(pos.roomName);
		vis.rect(pos.x, pos.y - CHAR_HEIGHT, width, 1.1 * CHAR_HEIGHT, {
			opacity: 0.15,
		});
		vis.box(
			pos.x,
			pos.y - CHAR_HEIGHT,
			width,
			height + (1.1 + 0.25) * CHAR_HEIGHT,
			{ color: TEXT_COLOR }
		);
		vis.text(title, pos.x + 0.25, pos.y - 0.05, this.textStyle());
		return { x: pos.x + 0.25, y: pos.y + 1.1 * CHAR_HEIGHT };
	}

	static infoBox(
		header: string,
		content: string[] | string[][],
		pos: { x: number; y: number; roomName?: string },
		width: number
	): number {
		const height = CHAR_HEIGHT * (content.length || 1);
		const { x, y } = this.section(header, pos, width, height);
		if (content.length > 0) {
			if (_.isArray(content[0])) {
				this.table(content as string[][], {
					x: x,
					y: y,
					roomName: pos.roomName,
				});
			} else {
				this.multitext(content as string[], {
					x: x,
					y: y,
					roomName: pos.roomName,
				});
			}
		}
		const spaceBuffer = 0.5;
		return y + height + spaceBuffer;
	}

	static barGraph(
		progress: number | [number, number],
		pos: { x: number; y: number; roomName?: string },
		width = 7,
		scale = 1,
		fmt?: (num: number) => string
	): void {
		const vis = new RoomVisual(pos.roomName);
		let percent: number;
		let mode: "percent" | "fraction";
		if (typeof progress === "number") {
			percent = progress;
			mode = "percent";
		} else {
			percent = progress[0] / progress[1];
			mode = "fraction";
		}
		// Draw frame
		vis.box(
			pos.x,
			pos.y - CHAR_HEIGHT * scale,
			width,
			1.1 * scale * CHAR_HEIGHT,
			{ color: TEXT_COLOR }
		);
		vis.rect(
			pos.x,
			pos.y - CHAR_HEIGHT * scale,
			percent * width,
			1.1 * scale * CHAR_HEIGHT,
			{
				fill: TEXT_COLOR,
				opacity: 0.4,
				strokeWidth: 0,
			}
		);
		// Draw text
		if (mode == "percent") {
			const str = fmt ? fmt(percent) : `${Math.round(100 * percent)}%`;
			vis.text(
				str,
				pos.x + width / 2,
				pos.y - 0.1 * CHAR_HEIGHT,
				this.textStyle(1, { align: "center" })
			);
		} else {
			const [num, den] = progress as [number, number];
			const nStr = fmt ? fmt(num) : `${num}`;
			const dStr = fmt ? fmt(den) : `${den}`;
			vis.text(
				`${nStr}/${dStr}`,
				pos.x + width / 2,
				pos.y - 0.1 * CHAR_HEIGHT,
				this.textStyle(1, { align: "center" })
			);
		}
	}

	static table(
		data: string[][],
		pos: { x: number; y: number; roomName?: string }
	): void {
		if (data.length == 0) {
			return;
		}
		const colPadding = 4;
		const vis = new RoomVisual(pos.roomName);

		const style = this.textStyle();

		// Determine column locations
		const columns = Array(_.first(data).length).fill(0) as number[];
		for (const entries of data) {
			for (let i = 0; i < entries.length - 1; i++) {
				columns[i] = Math.max(columns[i], entries[i].length);
			}
		}

		let dy = 0;
		for (const entries of data) {
			let dx = 0;
			for (let i = 0; i < entries.length; i++) {
				vis.text(entries[i], pos.x + dx, pos.y + dy, style);
				dx += CHAR_WIDTH * (columns[i] + colPadding);
			}
			dy += CHAR_HEIGHT;
		}
	}

	static multitext(
		lines: string[],
		pos: { x: number; y: number; roomName?: string }
	): void {
		if (lines.length == 0) {
			return;
		}
		const vis = new RoomVisual(pos.roomName);
		const style = this.textStyle();
		// Draw text
		let dy = 0;
		for (const line of lines) {
			vis.text(line, pos.x, pos.y + dy, style);
			dy += CHAR_HEIGHT;
		}
	}
}

declare global {
	interface CostMatrix {
		_bits: Uint8Array;
	}
}

function getMaxValue(matrix: CostMatrix): number {
	return _.max(matrix._bits);
}

function componentToHex(n: number): string {
	const hex = n.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r: number, g: number, b: number): string {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
