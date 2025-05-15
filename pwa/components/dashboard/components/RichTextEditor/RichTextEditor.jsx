import React, { useRef, useState, useEffect } from 'react';

export function RichTextEditor({
  content,
  onChange,
  minFontSize = 12,
  maxFontSize = 48,
  initialFontSize = 16,
}) {
  const editableRef = useRef(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [fontSize, setFontSize] = useState(initialFontSize);

  // Met à jour le contenu editable quand la prop content change
  useEffect(() => {
    if (editableRef.current && editableRef.current.innerHTML !== content) {
      editableRef.current.innerHTML = content || '';
    }
  }, [content]);

  // Fonction générique pour execCommand
  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    triggerChange();
  };

  // Ajoute un lien via execCommand('createLink', url)
  const handleAddLink = () => {
    if (!linkUrl.trim()) {
      alert('L’URL ne peut pas être vide');
      return;
    }
    // Si le texte du lien est renseigné, on le remplace dans la sélection avant d’ajouter le lien
    if (linkText.trim()) {
      // Remplace la sélection par le texte personnalisé
      execCmd('insertText', linkText.trim());
      // Place la sélection sur ce texte nouvellement inséré
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.setStart(range.endContainer, range.endOffset - linkText.trim().length);
        range.setEnd(range.endContainer, range.endOffset);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    // Crée le lien
    execCmd('createLink', linkUrl.trim());
    // Reset état
    setLinkUrl('');
    setLinkText('');
    setShowLinkInput(false);
  };

  // Détecte et transmet le changement de contenu
  const triggerChange = () => {
    if (editableRef.current) {
      onChange(editableRef.current.innerHTML);
    }
  };

  // Gestion taille de police par execCommand('fontSize') utilise des valeurs 1 à 7 -> workaround avec span et style
  // Ici on applique directement le style en inline sur la sélection
  const changeFontSize = (newSize) => {
    if (newSize < minFontSize || newSize > maxFontSize) return;
    setFontSize(newSize);

    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);

    if (range.collapsed) return; // rien de sélectionné

    // Crée un span avec le style de taille
    const span = document.createElement('span');
    span.style.fontSize = `${newSize}px`;
    range.surroundContents(span);

    triggerChange();
  };

  return (
    <div>
      <div style={{ marginBottom: 8, userSelect: 'none' }}>
        <button
          type="button"
          onClick={() => execCmd('bold')}
          aria-label="Gras"
          title="Gras"
        ><b>B</b></button>

        <button
          type="button"
          onClick={() => execCmd('italic')}
          aria-label="Italique"
          title="Italique"
          style={{ marginLeft: 8 }}
        ><i>I</i></button>

        <button
          type="button"
          onClick={() => execCmd('underline')}
          aria-label="Souligné"
          title="Souligné"
          style={{ marginLeft: 8 }}
        ><u>U</u></button>

        <button
          type="button"
          onClick={() => changeFontSize(fontSize - 2)}
          aria-label="Diminuer la taille de la police"
          title="Diminuer la taille"
          style={{ marginLeft: 20 }}
          disabled={fontSize <= minFontSize}
        >A-</button>

        <button
          type="button"
          onClick={() => changeFontSize(fontSize + 2)}
          aria-label="Augmenter la taille de la police"
          title="Augmenter la taille"
          style={{ marginLeft: 8 }}
          disabled={fontSize >= maxFontSize}
        >A+</button>

        <button
          type="button"
          onClick={() => setShowLinkInput(!showLinkInput)}
          aria-label="Ajouter un lien"
          title="Ajouter un lien"
          style={{ marginLeft: 20 }}
        >🔗</button>
      </div>

      {showLinkInput && (
        <div style={{ marginBottom: 8 }}>
          <input
            type="text"
            placeholder="Texte du lien (optionnel)"
            value={linkText}
            onChange={e => setLinkText(e.target.value)}
            style={{ marginRight: 8 }}
          />
          <input
            type="url"
            placeholder="URL"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            style={{ marginRight: 8 }}
          />
          <button onClick={handleAddLink} type="button">Valider</button>
          <button onClick={() => setShowLinkInput(false)} type="button" style={{ marginLeft: 8 }}>Annuler</button>
        </div>
      )}

      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        onInput={triggerChange}
        style={{
          minHeight: 100,
          border: '1px solid #ccc',
          padding: 8,
          fontSize: `${fontSize}px`,
          borderRadius: 4,
          outline: 'none',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      />
    </div>
  );
}

// EXEMPLE D'UTILISATION
// import React, { useState } from 'react';
// import { RichTextEditor } from './RichTextEditor';

// export default function Demo() {
//   const [content, setContent] = useState('<p>Texte initial</p>');

//   return (
//     <div>
//       <h2>Mon éditeur de texte enrichi</h2>
//       <RichTextEditor
//         content={content}
//         onChange={setContent}
//         initialFontSize={16}
//       />
//       <h3>Contenu HTML :</h3>
//       <pre style={{ backgroundColor: '#eee', padding: 10, marginTop: 10 }}>
//         {content}
//       </pre>
//     </div>
//   );
// }
