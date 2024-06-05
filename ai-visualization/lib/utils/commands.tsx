import { EditableComponent, ItemPropertyChange, executePropertyChange, revertPropertyChange } from "./properties";

export class Command<T> {
    name: string;
    done: boolean;
    cmd_do: (obj: T) => void;
    cmd_undo: (obj: T) => void;

    constructor(name: string, cmd_do: (obj: T) => void, cmd_undo: (obj: T) => void) {
        this.name = name;
        this.done = false;
        this.cmd_do = cmd_do;
        this.cmd_undo = cmd_undo;
    }

    execute(obj: T) {
        if (this.done) throw new Error(`Command ${this.name} already executed, cannot be re-executed.`);
        this.cmd_do(obj);
        this.done = true;
    }
    revert(obj: T) {
        if (!this.done) throw new Error(`Command ${this.name} not yet executed, cannot be reverted.`);
        this.cmd_undo(obj);
        this.done = false;
    }
}

export class CommandHandler<T> {
    commandQueue: Command<T>[];
    currentIndex: number;
    executedIndex: number;

    constructor() {
        this.currentIndex = -1;
        this.executedIndex = -1;
        this.commandQueue = [];
    }

    cleanUp() {
        while (this.currentIndex < this.commandQueue.length - 1) {
            this.commandQueue.pop();
        }
    }

    executeToCurrent(obj: T): Command<T>[] {
        let result = [];
        while (this.executedIndex < this.currentIndex) {
            this.executedIndex++;
            let cmd = this.commandQueue[this.executedIndex];
            cmd.execute(obj);
            result.push(cmd);
        }
        while (this.executedIndex > this.currentIndex) {
            let cmd = this.commandQueue[this.executedIndex];
            cmd.revert(obj);
            result.push(cmd);
            this.executedIndex--;
        }
        return result;
    }

    addCommand(command: Command<T>) {
        this.cleanUp();
        this.commandQueue.push(command);
        this.currentIndex++;
    }

    canRedo() {return this.currentIndex < this.commandQueue.length - 1;}
    queueRedo() {
        if (!this.canRedo()) {
            throw new Error("No more commands to redo.");
        }
        this.currentIndex++;
    }
    canUndo() {return this.currentIndex >= 0;}
    queueUndo() {
        if (!this.canUndo()) {
            throw new Error("No more commands to undo.");
        }
        this.currentIndex--;
    }
}

export class PropertyChangeCommand extends Command<any> {
    changes: ItemPropertyChange<EditableComponent>[];
    constructor(changes: ItemPropertyChange<EditableComponent>[]) {
        super("Change Property", (_) => {
            this.changes.forEach(c => executePropertyChange(c));
        }, (_) => {
            this.changes.forEach(c => revertPropertyChange(c));
        });
        this.changes = changes;
    }
}