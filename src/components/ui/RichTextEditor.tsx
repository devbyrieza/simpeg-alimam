"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill/dist/quill.snow.css";

// Dynamic import with ssr: false is required for React-Quill in Next.js
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false, loading: () => <div className="h-40 bg-slate-50 border border-slate-200 rounded-xl animate-pulse"></div> });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  }), []);

  return (
    <div className="bg-white rounded-xl overflow-hidden [&_.quill]:rounded-xl [&_.ql-toolbar]:bg-slate-50 [&_.ql-toolbar]:border-slate-200 [&_.ql-toolbar]:rounded-t-xl [&_.ql-container]:border-slate-200 [&_.ql-container]:rounded-b-xl [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:text-sm">
      <ReactQuill 
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
      />
    </div>
  );
}
