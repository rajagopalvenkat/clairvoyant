import {expect, jest, test} from '@jest/globals';
import { merge } from '../objects';

test("Merge Tests", () => {
    expect(merge({"a": 1}, {"a": 2})).toMatchObject({"a": 2});
    expect(merge({"a": 1}, {"b": 2})).toMatchObject({"a": 1, "b": 2});
    expect(merge({"a": {"a": 1, "b": 2}}, {"a": {"a": 3}})).toMatchObject({"a": {"a": 3, "b": 2}})
    let o1: Record<any, any> = {};
    o1["a"] = o1;
    let o2: Record<any, any> = {};
    o2["a"] = o2;
    expect(() => merge(o1, o2)).toThrowError();
})