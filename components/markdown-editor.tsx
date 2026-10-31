"use client";

import React, { useEffect, useRef } from "react";
import "simplemde/dist/simplemde.min.css";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write markdown here...",
  className = "",
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mdeInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initSimpleMDE() {
      if (!textareaRef.current) return;
      // SimpleMDE relies on browser window and CodeMirror
      const SimpleMDE = (await import("simplemde")).default;

      if (!isMounted || !textareaRef.current) return;

      if (mdeInstanceRef.current) {
        mdeInstanceRef.current.toTextArea();
        mdeInstanceRef.current = null;
      }

      const instance = new SimpleMDE({
        element: textareaRef.current,
        initialValue: value || "",
        placeholder,
        spellChecker: false,
        status: false,
        toolbar: [
          "bold",
          "italic",
          "heading",
          "|",
          "quote",
          "unordered-list",
          "ordered-list",
          "|",
          "link",
          "image",
          "table",
          "|",
          "preview",
          "side-by-side",
          "fullscreen",
        ],
      });

      instance.codemirror.on("change", () => {
        onChange(instance.value());
      });

      mdeInstanceRef.current = instance;
    }

    initSimpleMDE();

    return () => {
      isMounted = false;
      if (mdeInstanceRef.current) {
        try {
          mdeInstanceRef.current.toTextArea();
        } catch {}
        mdeInstanceRef.current = null;
      }
    };
  }, []);

  // Update instance value if external value changes significantly
  useEffect(() => {
    if (mdeInstanceRef.current && mdeInstanceRef.current.value() !== value) {
      mdeInstanceRef.current.value(value || "");
    }
  }, [value]);

  return (
    <div className={`simplemde-container text-black ${className}`}>
      <textarea ref={textareaRef} defaultValue={value} />
    </div>
  );
}
