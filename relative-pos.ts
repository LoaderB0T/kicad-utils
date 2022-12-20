import fs from "fs";

type Pos = { x: number; y: number; rot: number };

const filename = "D:/git/awd-keyboard/pcb/v2/base/awdware-keyboard.kicad_pcb";

const lines: string[] = fs.readFileSync(filename, "utf-8").split("\r\n");

const getPosOfComponent = (name: string): Pos => {
  const lineWithRef = lines.findIndex((line) =>
    line.includes(`reference "${name}"`)
  );
  for (let i = lineWithRef; i >= 0; i--) {
    const match = lines[i].match(/^\s*\(at (\S*) (\S*)(?: (\S*))?\)/);
    if (match) {
      return {
        x: Number(match[1]),
        y: Number(match[2]),
        rot: Number(match[3] ?? 0),
      };
    }
  }
};

const setPosOfComponent = (name: string, pos: Pos) => {
  const lineWithRef = lines.findIndex((line) =>
    line.includes(`reference "${name}"`)
  );

  for (let i = lineWithRef; i >= 0; i--) {
    const match = lines[i].match(/^\s*\(at (\S*) (\S*)(?: (\S*))?\)/);
    if (match) {
      lines[i] = lines[i].replace(
        /^\s*\(at (\S*) (\S*)(?: (\S*))?\)/,
        pos.rot
          ? `  (at ${pos.x} ${pos.y} ${pos.rot})`
          : `  (at ${pos.x} ${pos.y})`
      );
      return;
    }
  }
};

const K1_pos = getPosOfComponent("K1");
const D1_pos = getPosOfComponent("D1");

const rel_x = K1_pos.x - D1_pos.x;
const rel_y = K1_pos.y - D1_pos.y;
const rel_rot = K1_pos.rot - D1_pos.rot;

for (let i = 2; i <= 88; i++) {
  const pos_i = getPosOfComponent(`K${i}`);
  const new_pos_i = {
    x: pos_i.x - rel_x,
    y: pos_i.y - rel_y,
    rot: pos_i.rot - rel_rot,
  };
  setPosOfComponent(`D${i}`, new_pos_i);
}

fs.writeFileSync(filename, lines.join("\r\n"));
