import { useEffect, useRef } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { sql } from '@codemirror/lang-sql';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'sql' | 'python';
  readOnly?: boolean;
}

export function CodeEditor({ value, onChange, language, readOnly = false }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Rebuild editor when language changes
  useEffect(() => {
    if (!containerRef.current) return;

    const langExtension = language === 'sql' ? sql() : python();

    const extensions = [
      langExtension,
      oneDark,
      EditorState.readOnly.of(readOnly),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
        }
      }),
      EditorView.theme({
        '&': { fontSize: '13px' },
        '.cm-scroller': { fontFamily: "'Fira Code', 'Consolas', monospace" },
      }),
    ];

    const view = new EditorView({
      state: EditorState.create({ doc: value, extensions }),
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Sync external value changes without triggering onChange loop
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return <div ref={containerRef} style={{ border: '1px solid #3c3c3c', borderRadius: 4 }} />;
}
