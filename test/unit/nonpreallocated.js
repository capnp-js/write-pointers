/* @flow */

import * as assert from "assert";
import { describe, it } from "mocha";

import { Unlimited } from "@capnp-js/base-arena";
import { Builder } from "@capnp-js/builder-arena";
import { int32 } from "@capnp-js/read-data";
import { root } from "@capnp-js/memory";

import nonpreallocated from "../../src/nonpreallocated";

describe("nonpreallocated", function () {
  describe("struct", function () {
    const arena = Builder.fresh(120, new Unlimited());
    const ref = root(arena);
    arena.allocate(88);

    const local = arena.allocate(24);
    assert.deepEqual(local.segment, arena.segment(0));

    const far = arena.allocate(24);
    assert.deepEqual(far.segment, arena.segment(1));

    //TODO: Check that offset=-1 for trivial struct pointer written at its ambiguous position.
    it("encodes struct pointer locally if possible", function () {
      nonpreallocated(arena, ref, local, 0x00, (0x02<<16) | 0x01);
      assert.equal(int32(arena.segment(0).raw, 0), ((96-8)>>>1) | 0x00); // 3-2 = 1 for the shift
      assert.equal(int32(arena.segment(0).raw, 4), (0x02<<16) | 0x01);
    });

    it("encodes struct pointer on the object's segment if possible", function () {
      nonpreallocated(arena, ref, far, 0x00, (0x02<<16) | 0x01);
      // The landing pad goes right after the allocated bytes
      assert.equal(int32(arena.segment(0).raw, 0), 24 | 0x02); // 3-3 = 0 for the shift
      assert.equal(int32(arena.segment(0).raw, 4), 1);
      // The landing pad points back to the allocated bytes
      assert.equal(int32(arena.segment(1).raw, 24), ((-4)<<2) | 0x00);
      assert.equal(int32(arena.segment(1).raw, 28), (0x02<<16) | 0x01);
    });

    it("encodes struct pointer on yet another segment if necessary", function () {
      // Fill up segment 1 so that the landing pad goes on segment 2
      arena.allocate(arena.segment(1).raw.length - arena.segment(1).end);
      nonpreallocated(arena, ref, far, 0x00, (0x02<<16) | 0x01);
      // The landing pad goes at the front of segment 2
      assert.equal(int32(arena.segment(0).raw, 0), 0 | 0x04 | 0x02);
      assert.equal(int32(arena.segment(0).raw, 4), 2);
      // The landing pad pointers back to segment 1
      assert.equal(int32(arena.segment(2).raw, 0), 0 | 0x00 | 0x02);
      assert.equal(int32(arena.segment(2).raw, 4), 1);
      assert.equal(int32(arena.segment(2).raw, 8), 0x00);
      assert.equal(int32(arena.segment(2).raw, 12), (0x02<<16) | 0x01);
    });
  });

  describe("list", function () {
    const arena = Builder.fresh(120, new Unlimited());
    const ref = root(arena);
    arena.allocate(88);

    const local = arena.allocate(24);
    assert.deepEqual(local.segment, arena.segment(0));

    const far = arena.allocate(24);
    assert.deepEqual(far.segment, arena.segment(1));

    it("encodes list pointer locally if possible", function () {
      nonpreallocated(arena, ref, local, 0x01, (3<<3) | 0x05);
      assert.equal(int32(arena.segment(0).raw, 0), ((96-8)>>>1) | 0x01); // 3-2 = 1 for the shift
      assert.equal(int32(arena.segment(0).raw, 4), (3<<3) | 0x05);
    });

    it("encodes list pointer on the object's segment if possible", function () {
      nonpreallocated(arena, ref, far, 0x01, (3<<3) | 0x05);
      // The landing pad goes right after the allocated bytes
      assert.equal(int32(arena.segment(0).raw, 0), 24 | 0x02); // 3-3 = 0 for the shift
      assert.equal(int32(arena.segment(0).raw, 4), 1);
      // The landing pad points back to the allocated bytes
      assert.equal(int32(arena.segment(1).raw, 24), ((-4)<<2) | 0x01);
      assert.equal(int32(arena.segment(1).raw, 28), (3<<3) | 0x05);
    });

    it("encodes list pointer on yet another segment if necessary", function () {
      // Fill up segment 1 so that the landing pad goes on segment 2
      arena.allocate(arena.segment(1).raw.length - arena.segment(1).end);
      nonpreallocated(arena, ref, far, 0x01, (3<<3) | 0x05);
      // The landing pad goes at the front of segment 2
      assert.equal(int32(arena.segment(0).raw, 0), 0 | 0x04 | 0x02);
      assert.equal(int32(arena.segment(0).raw, 4), 2);
      // The landing pad pointers back to segment 1
      assert.equal(int32(arena.segment(2).raw, 0), 0 | 0x00 | 0x02);
      assert.equal(int32(arena.segment(2).raw, 4), 1);
      assert.equal(int32(arena.segment(2).raw, 8), 0x01);
      assert.equal(int32(arena.segment(2).raw, 12), (3<<3) | 0x05);
    });
  });
});
