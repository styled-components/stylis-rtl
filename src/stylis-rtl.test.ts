import { compile, Middleware, middleware, prefixer, serialize, stringify } from 'stylis';
import stylisRtlPlugin from './stylis-rtl';

const stylis = (css: string, extraPlugins: Middleware[] = []) =>
  serialize(compile(css), middleware([stylisRtlPlugin, ...extraPlugins, stringify]));

describe('integration test with stylis', () => {
  it('flips simple rules', () => {
    expect(
      stylis(
        `.a {
          padding-left: 5px;
          margin-right: 5px;
          border-left: 1px solid red;
        }
      `
      )
    ).toMatchInlineSnapshot(`".a{padding-right:5px;margin-left:5px;border-right:1px solid red;}"`);
  });

  it('flips shorthands', () => {
    expect(
      stylis(
        `.a {
          padding: 0 5px 0 0;
          margin: 0 0 0 5px;
        }
        `
      )
    ).toMatchInlineSnapshot(`".a{padding:0 0 0 5px;margin:0 5px 0 0;}"`);
  });

  it('handles noflip directives', () => {
    expect(
      stylis(
        `
          .a {
            /* @noflip */
            padding: 0 5px 0 0;
            margin: 0 0 0 5px;
          }
        `
      )
    ).toMatchInlineSnapshot(`".a{padding:0 5px 0 0;margin:0 5px 0 0;}"`);
  });

  it('flips keyframes', () => {
    expect(
      stylis(
        `@keyframes a {
          0% { left: 0px; }
          100% { left: 100px; }
        }
      `
      )
    ).toMatchInlineSnapshot(`"@keyframes a{0%{right:0px;}100%{right:100px;}}"`);
  });

  it('flips media queries', () => {
    expect(
      stylis(
        `@media (min-width: 500px) {
          .a {
            padding-left: 5px;
            margin-right: 5px;
            border-left: 1px solid red;
          }
        }
      `
      )
    ).toMatchInlineSnapshot(
      `"@media (min-width: 500px){.a{padding-right:5px;margin-left:5px;border-right:1px solid red;}}"`
    );
  });

  it('flips supports queries', () => {
    expect(
      stylis(
        `@supports (display: flex) {
          .a {
            padding-left: 5px;
            margin-right: 5px;
            border-left: 1px solid red;
          }
        }
      `
      )
    ).toMatchInlineSnapshot(
      `"@supports (display: flex){.a{padding-right:5px;margin-left:5px;border-right:1px solid red;}}"`
    );
  });

  it('works in tandem with prefixer', () => {
    expect(
      stylis(
        `@keyframes a {
          0% { left: 0px; }
          100% { left: 100px; }
        }
      `,
        [prefixer]
      )
    ).toMatchInlineSnapshot(
      `"@-webkit-keyframes a{0%{right:0px;}100%{right:100px;}}@keyframes a{0%{right:0px;}100%{right:100px;}}"`
    );
  });

  it("doesn't crash on empty rules", () => {
    // this generates nodes for:
    // .cls{}
    // .cls .nested{color:hotpink;}
    expect(
      stylis(`
        .cls {
          & .nested {
            color:hotpink;
          }
        }
      `)
    ).toMatchInlineSnapshot(`".cls .nested{color:hotpink;}"`);
  });

  it('works for nested rules', () => {
    expect(
      stylis(`
        .cls {
          margin-right: 32px;
          & .first-child {
            margin-right: 32px;
          }
        }
      `)
    ).toMatchInlineSnapshot(`".cls{margin-left:32px;}.cls .first-child{margin-left:32px;}"`);
  });
});
