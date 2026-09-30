"use client"

import {useEffect, useRef, useState, type ChangeEvent} from "react"
import {EditorContent, useEditor} from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import {codeLanguageOptions, createCodeLowlight} from "@/lib/code"

const lowlight = createCodeLowlight()

type RichTextEditorProps = {
  editorKey: number
  initialContent?: string
  onChange: (value: {html: string; json: unknown}) => void
  onUploadImage: (file: File) => Promise<string>
}

type ToolbarButtonProps = {
  label: string
  isActive?: boolean
  onClick: () => void
}

function ToolbarButton({label, isActive, onClick}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm transition ${
        isActive
          ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
          : "border-neutral-200 text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-200"
      }`}
    >
      {label}
    </button>
  )
}

export default function RichTextEditor({
  editorKey,
  initialContent,
  onChange,
  onUploadImage,
}: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [selectedCodeLanguage, setSelectedCodeLanguage] = useState("javascript")

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          codeBlock: false,
        }),
        CodeBlockLowlight.configure({
          lowlight,
        }),
        Image.configure({
          HTMLAttributes: {
            class: "editor-image",
          },
        }),
        Placeholder.configure({
          placeholder:
            "Write your explanation, add headings, and drop in code snippets or images...",
        }),
      ],
      editorProps: {
        attributes: {
          class:
            "ProseMirror min-h-[360px] rounded-3xl border border-neutral-200 bg-white px-5 py-4 text-sm text-neutral-800 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100",
        },
      },
      content:
        initialContent ||
        "<h2>Start writing your post</h2><p>Explain the topic, add examples, then insert code snippets or screenshots.</p>",
      onCreate({editor: currentEditor}) {
        onChange({
          html: currentEditor.getHTML(),
          json: currentEditor.getJSON(),
        })
      },
      onUpdate({editor: currentEditor}) {
        onChange({
          html: currentEditor.getHTML(),
          json: currentEditor.getJSON(),
        })
      },
      onSelectionUpdate({editor: currentEditor}) {
        if (!currentEditor.isActive("codeBlock")) {
          return
        }

        const currentLanguage = currentEditor.getAttributes("codeBlock").language

        if (currentLanguage) {
          setSelectedCodeLanguage(currentLanguage)
        }
      },
    },
    [editorKey, initialContent]
  )

  useEffect(() => {
    if (!editor) {
      return
    }

    editor.commands.focus("end")
  }, [editor])

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file || !editor) {
      return
    }

    setIsUploadingImage(true)

    try {
      const imageUrl = await onUploadImage(file)

      editor.chain().focus().setImage({src: imageUrl, alt: file.name}).run()
    } finally {
      setIsUploadingImage(false)
      event.target.value = ""
    }
  }

  if (!editor) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
        Loading editor...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <ToolbarButton
          label="P"
          isActive={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        />
        <ToolbarButton
          label="H2"
          isActive={editor.isActive("heading", {level: 2})}
          onClick={() => editor.chain().focus().toggleHeading({level: 2}).run()}
        />
        <ToolbarButton
          label="H3"
          isActive={editor.isActive("heading", {level: 3})}
          onClick={() => editor.chain().focus().toggleHeading({level: 3}).run()}
        />
        <ToolbarButton
          label="Bold"
          isActive={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Italic"
          isActive={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="List"
          isActive={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="Steps"
          isActive={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          label="Quote"
          isActive={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          label="Code Block"
          isActive={editor.isActive("codeBlock")}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleCodeBlock({language: selectedCodeLanguage})
              .run()
          }
        />
        <select
          value={selectedCodeLanguage}
          onChange={event => {
            const nextLanguage = event.target.value

            setSelectedCodeLanguage(nextLanguage)

            if (editor.isActive("codeBlock")) {
              editor
                .chain()
                .focus()
                .updateAttributes("codeBlock", {language: nextLanguage})
                .run()
            }
          }}
          className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-700 outline-none transition focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          aria-label="Code language"
        >
          {codeLanguageOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-700 transition hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-200"
        >
          {isUploadingImage ? "Uploading..." : "Image"}
        </button>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Choose a language, click <span className="font-medium">Code Block</span>,
        and your blog will show a themed snippet with a copy button.
      </p>

      <EditorContent editor={editor} />
    </div>
  )
}
