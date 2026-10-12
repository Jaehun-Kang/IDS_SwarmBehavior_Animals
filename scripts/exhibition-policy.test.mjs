import test from "node:test";
import assert from "node:assert/strict";
import policy from "./exhibition-policy.cjs";

const { exhibitionKeyAction, isExhibitionUrl } = policy;
for (const platform of ["win32", "darwin"]) {
  test(`${platform}: refresh and developer shortcuts are blocked`, () => {
    for (const type of ["keyDown", "keyUp"]) {
      for (const key of ["F5", "F12", "F11", "BrowserRefresh"]) {
        assert.equal(exhibitionKeyAction({ key, type }, platform), "block");
        assert.equal(exhibitionKeyAction({ key, type, control: true, shift: true }, platform), "block");
      }
      for (const modifier of ["control", "meta"]) {
        for (const shift of [false, true]) {
          assert.equal(exhibitionKeyAction({ code: "KeyR", key: "ㄱ", type, [modifier]: true, shift }, platform), "block");
        }
        for (const code of ["KeyI", "KeyJ", "KeyC"]) {
          assert.equal(exhibitionKeyAction({ code, type, [modifier]: true, shift: true }, platform), "block");
          assert.equal(exhibitionKeyAction({ code, type, [modifier]: true, alt: true }, platform), "block");
        }
      }
    }
  });
  test(`${platform}: interaction keys remain available`, () => {
    for (const key of ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "Enter", "Escape", " ", "r", "i"]) {
      assert.equal(exhibitionKeyAction({ key }, platform), "allow");
    }
    assert.equal(exhibitionKeyAction({ key: "c", control: true }, platform), "allow");
  });
  test(`${platform}: operator can exit`, () => {
    assert.equal(exhibitionKeyAction({ key: "q", shift: true, control: true }, platform), "quit");
    assert.equal(exhibitionKeyAction({ key: "q", shift: true, meta: true }, platform), "quit");
    assert.equal(exhibitionKeyAction(platform === "win32" ? { key: "F4", alt: true } : { key: "q", meta: true }, platform), "quit");
  });
}
test("navigation stays inside the locally served app", () => {
  const start = "http://127.0.0.1:12345/IDS_SwarmBehavior_Animals/";
  assert(isExhibitionUrl(start + "EmperorPenguin/detail", start));
  assert(isExhibitionUrl(start + "?test=1#page", start));
  for (const target of ["https://example.com", "file:///C:/", "javascript:alert(1)", start.replace("12345", "12346"), "http://127.0.0.1:12345/other", "not a URL"]) {
    assert.equal(isExhibitionUrl(target, start), false);
  }
});
