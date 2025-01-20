import { Code, LezerHighlighter, makeScene2D } from '@motion-canvas/2d';
import { createRef, waitFor } from '@motion-canvas/core';
import { Editor, NeoVimSession, parseNeoVimSession } from '@sysraccoon/motion-canvas-editor';
import { parser as jsParser } from '@lezer/javascript';
import { parser as cssParser } from '@lezer/css';
import editorSession from '../../mce-session.json';

const tsHighlighter = new LezerHighlighter(
  jsParser.configure({
    dialect: 'jsx ts',
  }),
);

const cssHighlighter = new LezerHighlighter(cssParser);

export default makeScene2D(function*(view) {
  const snapshots = parseNeoVimSession(
    editorSession as NeoVimSession,
    (name, _content) => {
      if (name.endsWith('.css')) {
        return cssHighlighter;
      }

      if (name.endsWith('.ts') || name.endsWith('.tsx')) {
        return tsHighlighter;
      }

      return Code.defaultHighlighter;
    },
  );

  const editor = createRef<Editor>();
  view.add(
    <Editor
      ref={editor}
      editSnapshot={snapshots[0]}
      viewportProps={{
        maxWidth: 1440,
        maxHeight: 870,
      }}
      fontFamily={'Source Code Pro'}
      fontSize={30}
    />
  );

  for (let snapshot of snapshots) {
    yield* editor().tweenEditSnapshot(snapshot, 0.5);
    yield* waitFor(0.5);
  }

  yield* waitFor(2);
});
