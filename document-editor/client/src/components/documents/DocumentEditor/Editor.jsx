import { forwardRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import { 
  Box, 
  ToggleButton, 
  ToggleButtonGroup,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  Title,
  Link as LinkIcon,
  Image as ImageIcon,
  FormatColorText,
  TextFields,
  AutoFixHigh as AIIcon,
} from '@mui/icons-material';
import './Editor.css';

const rgbToHex = (rgb) => {
  // Handle if it's already hex
  if (rgb?.startsWith('#')) {
    return rgb;
  }
  
  // Handle rgb/rgba format
  const rgbMatch = rgb?.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  
  // Default fallback
  return '#000000';
};

const MenuBar = ({ editor, onAIRewrite }) => {
  if (!editor) {
    return null;
  }

  const handleAIClick = () => {
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(
      selection.from,
      selection.to,
      ' '
    );
    if (text) {
      onAIRewrite(text, selection);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: 1, 
      p: 1, 
      borderBottom: 1, 
      borderColor: 'divider' 
    }}>
      <ToggleButtonGroup size="small">
        <ToggleButton 
          value="bold"
          selected={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FormatBold />
        </ToggleButton>
        <ToggleButton
          value="italic"
          selected={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FormatItalic />
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      <ToggleButtonGroup size="small">
        <ToggleButton
          value="h1"
          selected={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Title />1
        </ToggleButton>
        <ToggleButton
          value="h2"
          selected={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Title />2
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      <ToggleButtonGroup size="small">
        <ToggleButton
          value="left"
          selected={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <FormatAlignLeft />
        </ToggleButton>
        <ToggleButton
          value="center"
          selected={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <FormatAlignCenter />
        </ToggleButton>
        <ToggleButton
          value="right"
          selected={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <FormatAlignRight />
        </ToggleButton>
        <ToggleButton
          value="justify"
          selected={editor.isActive({ textAlign: 'justify' })}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        >
          <FormatAlignJustify />
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      <ToggleButtonGroup size="small">
        <ToggleButton
          value="bulletList"
          selected={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FormatListBulleted />
        </ToggleButton>
        <ToggleButton
          value="orderedList"
          selected={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <FormatListNumbered />
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      <ToggleButtonGroup size="small">
        <ToggleButton
          value="underline"
          selected={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <FormatUnderlined />
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      <select
        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
        value={editor.getAttributes('textStyle').fontFamily}
        style={{ height: '30px', alignSelf: 'center' }}
      >
        <option value="">Default</option>
        <option value="Arial">Arial</option>
        <option value="Georgia">Georgia</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
      </select>

      <input
        type="color"
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        value={rgbToHex(editor.getAttributes('textStyle').color)}
        style={{ height: '30px', width: '40px', padding: '0', alignSelf: 'center' }}
      />

      <Divider orientation="vertical" flexItem />

      <Tooltip title="AI Rewrite">
        <IconButton 
          size="small"
          onClick={handleAIClick}
          disabled={!editor.can().chain().focus().run()}
        >
          <AIIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const Editor = forwardRef(({ onChange, onAIRewrite, content }, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        paragraph: {
          HTMLAttributes: {
            class: 'editor-paragraph'
          }
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'cursor-pointer text-blue-500 hover:text-blue-600',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
        allowBase64: true,
      }),
      TextStyle,
      Underline,
      Color,
      FontFamily.configure({
        types: ['textStyle'],
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      console.log('Editor content updated:', newContent);
      onChange?.(newContent);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content'
      }
    }
  });

  useEffect(() => {
    if (ref && editor) {
      ref.current = editor;
    }
  }, [editor, ref]);

  useEffect(() => {
    if (editor && content !== undefined && content !== editor.getHTML()) {
      console.log('Syncing editor content with prop:', content);
      editor.commands.setContent(content || '', false);
    }
  }, [content, editor]);

  return (
    <Box sx={{ 
      height: '100%',
      border: '1px solid rgba(0, 0, 0, 0.23)',
      borderRadius: 1,
      '&:hover': {
        borderColor: 'text.primary'
      },
      '&:focus-within': {
        borderColor: 'primary.main',
        borderWidth: 2
      }
    }}>
      <div className="tiptap">
        <MenuBar editor={editor} onAIRewrite={onAIRewrite} />
        <div className="editor-container">
          <EditorContent editor={editor} />
        </div>
      </div>
    </Box>
  );
});

Editor.displayName = 'Editor';

export default Editor; 