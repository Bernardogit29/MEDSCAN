import {test} from "node:test";
import assert from "node:assert/strict";
import {matchesRecord} from "./recordSearch.js";
test("search ignores accents, capitalization and repeated whitespace", () => {
  assert.ok(matchesRecord({name:"Ácido fólico",dose:"1 comprimido"},"  ACIDO   folico "));
  assert.ok(!matchesRecord({name:"Ácido fólico"},"acido ferro"));
});
test("search covers exam findings, symptoms and appointment preparation", () => {
  assert.ok(matchesRecord({result:{findings:[{name:"Hemoglobina"}]}},"hemoglobina"));
  assert.ok(matchesRecord({symptoms:"Dor ocular"},"ocular"));
  assert.ok(matchesRecord({professional:"Dra. Ana",documents:"Exame de sangue",questions:"Sono"},"ana sangue"));
});
test("search excludes account identifiers, URLs and other metadata", () => {
  assert.ok(!matchesRecord({_id:"secret-id",userId:"owner",imageUrl:"private-file"},"owner"));
  assert.ok(!matchesRecord({imageUrl:"private-file"},"private-file"));
  assert.ok(matchesRecord({},""));
});
