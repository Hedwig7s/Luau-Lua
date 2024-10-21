import * as Ast from "./ast.ts";
import fs from "fs";

export class ParseOutput {
    lines: Array<string[]>; 

    constructor() {
        this.lines = [];
    }
    parseCoordinate(coordinate: string): [number, number] {
        const [row, column] = coordinate.split(",").map(Number);
        return [row, column];
    }
    writeAtPosition(text: string, position: string|[number, number],insertNewlines = false) {
        let pos!: [number, number];
        if (typeof position === "string") {
            pos = this.parseCoordinate(position);
        } else {
            pos = position;
        }
        let [row, col] = pos;
        while (this.lines.length <= row) {
            this.lines.push([]);
        }
        for (const char of text) {
            if (char === "\n") {
                if (insertNewlines) {
                    this.lines.splice(row, 0, []);
                } else {
                    this.lines[row+1] = this.lines[row+1] ?? [];
                }
                row++;
                col = 0;
                continue;
            }
            this.lines[row][col] = char;
            col++;
        }
    }
    append(text: string) {
        if (this.lines.length === 0) {
            this.lines.push([]);
        }
        this.writeAtPosition(text, `${this.lines.length-1},${this.lines[this.lines.length-1].length}`);
    }
    toString(): string {
        const output = [];
        for (const line of this.lines) {
            if (line === undefined) {
                output.push("");
                continue;
            }
            const newline = [];
            for (let i = 0; i < line.length; i++) {
                newline.push(line[i] ?? " ");
            }
            output.push(newline.join(""));
        }
        return output.join("\n");
    }
}

export function positionToArray(position: string): string[] {
    return position.split(" - ");
}

export function parseAssignment(assignment: Ast.AstStatAssign|Ast.AstStatLocal, output: ParseOutput) {
    let firstVar = true;
    for (const variable of assignment.vars) {
        if (!TYPE_MAP[variable.type]) {
            console.error("Unknown variable type: " + variable.type);
            console.error(variable);
            break;
        }
        if (firstVar) {
            firstVar = false;
        } else {
            output.append(",");
        }
        TYPE_MAP[variable.type](variable, output);
    }
    if (assignment.values === undefined) {
        return output;
    }
    let firstValue = true;
    for (const value of assignment.values) {
        if (!TYPE_MAP[value.type]) {
            console.error("Unknown value type: " + value.type);
            console.error(value);
            break;
        }
        if (firstValue) {
            output.append(" = ");
            firstValue = false;
        } else {
            output.append(",");
        }
        TYPE_MAP[value.type](value, output);
    }
}

const TYPE_MAP: Record<string, (node: Ast.AstNode, output: ParseOutput) => void> = {
    "AstStatBlock": (node, output) => {parseScope(node as Ast.AstStatBlock, output)},
    "DoBlock": (node, output) => {
        const block = node as Ast.AstStatBlock;
        const pos = positionToArray(block.location)[0];
        output.writeAtPosition("do", pos);
        parseScope(block, output);
        const endPos = positionToArray(block.location)[1];
        if (block.hasEnd) {
            output.writeAtPosition("end", endPos);
        }
    },
    "AstStatLocal": (node, output) => {
        const local = node as Ast.AstStatLocal;
        const localCoords = positionToArray(local.location);
        const localPos = localCoords[0];
        output.writeAtPosition("local", localPos);
        parseAssignment(local, output);
    },
    "AstStatAssign": (node, output) => {
        const assign = node as Ast.AstStatAssign;
        parseAssignment(assign, output);
    },
    "AstLocal": (node, output) => {
        const local = node as Ast.AstLocal;
        output.writeAtPosition(local.name, positionToArray(local.location)[0]);
    },
    "AstExprGlobal": (node, output) => {
        const global = node as Ast.AstExprGlobal;
        output.writeAtPosition(global.global, positionToArray(global.location)[0]);
    },
    "AstExprLocal": (node, output) => {
        const local = node as Ast.AstExprLocal;
        output.writeAtPosition(local.local.name, positionToArray(local.location)[0]);
    },
    "AstExprConstantBool": (node, output) => {
        const bool = node as Ast.AstExprConstantBool;
        output.writeAtPosition(bool.value ? "true" : "false", positionToArray(bool.location)[0]);
    },
    "AstExprConstantNumber": (node, output) => {
        const number = node as Ast.AstExprConstantNumber;
        output.writeAtPosition(number.value.toString(), positionToArray(number.location)[0]);
    },
    "AstExprConstantString": (node, output) => {
        const string = node as Ast.AstExprConstantString;
        output.writeAtPosition(`"${string.value}"`, positionToArray(string.location)[0]);
    },
    "AstExprConstantNil": (node, output) => {
        const nil = node as Ast.AstExprConstantNil;
        output.writeAtPosition("nil", positionToArray(nil.location)[0]);
    },
}

export function parseScope(scope: Ast.AstStatBlock, output: ParseOutput = new ParseOutput()): ParseOutput {
    for (const node of scope.body) {
        if (node.type === "AstStatBlock") {
            TYPE_MAP["DoBlock"](node, output); // In theory there should only be AstStatBlock nodes within an AstStatBlock if it's a do block
        } else if (TYPE_MAP[node.type]) {
            TYPE_MAP[node.type](node, output);
        } else if (!node.type.startsWith("AstType")) { // Don't care about types
            console.error("Unknown node type: " + node.type);
            console.error(node);
            break;
        }
    }
    return output;
}

if (import.meta.main) {
    const input = fs.readFileSync(Bun.argv[2]).toString();
    const tree = JSON.parse(input);
    const scope = tree.root as Ast.AstStatBlock;
    const output = parseScope(scope);
    console.log(output.toString());
}
