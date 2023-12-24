import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { monaco } from '@/monaco/setup';
import { editor as MonacoEditorType } from 'monaco-editor';
import { debounce } from 'lodash-es';

interface EditorProps {
  language: string;
}

export interface EditorHandle {
  setValue: (value: string) => void;
  getValue: () => string;
}

const Editor = forwardRef<EditorHandle, EditorProps>(({ language }, ref) => {
  const editorRef = useRef<MonacoEditorType.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResize = debounce(() => {
    editorRef.current?.layout()
  }, 100)

  useEffect(() => {
    editorRef.current = monaco.editor.create(containerRef.current!, {
      value: '',
      language: language,
      theme: 'vs-dark'
    });

    editorRef.current.onDidChangeModelContent(() => {

    });

    window.addEventListener('resize', handleResize);

    return () => {
      editorRef.current?.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [language, handleResize]);

  // Expose method
  useImperativeHandle(ref, () => ({
    setValue: (value: string) => {
      if (editorRef.current) {
        editorRef.current.setValue(value.replace(/export\s/g, ''));
      }
    },
    getValue: () => {
      if (editorRef.current) {
        return editorRef.current.getValue()
      }
      return ''
    }
  }));

  return <div ref={containerRef} className='h-[80vh]' />;
});

export default Editor;