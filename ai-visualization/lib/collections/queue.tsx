export class QueueEmptyException extends Error {}

export class Queue<T> {
    // Queue internals:
    // head: the index of the first element
    // tail: the first free slot in the queue
    // if head == tail: queue is EMPTY
    // this means that the array can never be full, we wouldn't be able to tell if the queue is full or empty.
    // we'll have a padding slot in the array which is always at index (head - 1), considering wrapparound
    // so whenever ++tail % length == head, we re-expand the array!

    // Memory constrants:
    // Uses o(4(n+1)) memory
    // All operations are O(1) amortized. O(n) worst case for individual operations

    elements: (T | undefined)[]
    head: number
    tail: number 
    constructor(initialCapacity = 0) {
        if (initialCapacity < 0) {
            throw new Error(`The capacity of a queue must be at least 0, received ${initialCapacity}`);
        }

        this.elements = []
        for (let i = 0; i < initialCapacity + 1; i++) {
            this.elements.push(undefined);
        }
        this.head = 0;
        this.tail = 0;
    }
    enqueue(element : T) {
        let newTail = this.nextIndex(this.tail);
        if (newTail === this.head) {
            // must expand first, update tail
            this.expand()
            newTail = this.nextIndex(this.tail);
        }
        this.elements[this.tail] = element;
        this.tail = newTail;
    }
    dequeue(): T {
        if (this.isEmpty()) throw new QueueEmptyException();
        const item = this.elements[this.head];
        delete this.elements[this.head];
        this.head = this.nextIndex(this.head);
        return item as T;
    }
    peek(): T {
        if (this.isEmpty()) throw new QueueEmptyException();
        return this.elements[this.head] as T;
    }

    // expand works as follows:
    //  Doubles the *effective capacity* of the queue, adding at least one slot.
    //  e.g. queue [xHT] becomes [p,x], where x is an undefined filler and H and T after some value indicates it's the head and/or tail
    //  e.g. queue [1H,2,3,4,xT] becomes [1H,2,3,4,xT,x,x,x,x]
    //  e.g. queue [3,xT,1H,2] becomes [3,xT,x,x,x,1H,2]
    //  e.g. queue [xT,1H,2] becomes [xT,x,x,1H,2]
    private expand() {
        let addedCapacity = Math.max(1, this.elements.length - 1);
        for (let i = 0; i < addedCapacity; i++) {
            this.elements.push(undefined);
        }
        
        if (this.tail < this.head) {
            // case 1: queue wraps, push all existing elements after head to the end
            for (let i = this.head; i < this.elements.length - addedCapacity; i++) {
                this.elements[i + addedCapacity] = this.elements[i];
                delete this.elements[i];
            }
            this.head += addedCapacity;
        }
        // case 2: queue doesn't wrap, representation is still valid
        // we don't need to do anything in this case
    }

    // effectively, reverts an expansion operation
    private shrink() {
        // TO DO
    }

    private nextIndex(index: number) {
        return (index + 1) % this.elements.length;
    }

    get length() {
        let result = this.tail - this.head;
        if (result < 0) {
            // queue wraps, the length is actually the number of elements before tail (excl.) and after head (incl.)
            // that is, tail + (length - head) = (tail - head) + length = result + length
            return result + this.elements.length;
        }
        return result;
    }
    isEmpty(): boolean {
        return this.length === 0;
    }
}