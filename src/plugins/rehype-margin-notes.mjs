import { visitParents } from 'unist-util-visit-parents';

export default function rehypeMarginNotes() {
  return (tree) => {
    const footnoteContent = new Map();
    let footnotesSectionIndex = -1;

    tree.children.forEach((node, i) => {
      if (node.type === 'element' && node.tagName === 'section' && node.properties?.dataFootnotes !== undefined) {
        footnotesSectionIndex = i;
        const ol = node.children.find((c) => c.type === 'element' && c.tagName === 'ol');
        if (ol) {
          for (const li of ol.children) {
            if (li.type !== 'element' || li.tagName !== 'li') continue;
            const id = li.properties?.id;
            if (typeof id !== 'string') continue;
            footnoteContent.set(id, stripBackrefs(li.children));
          }
        }
      }
    });

    if (footnotesSectionIndex === -1 || footnoteContent.size === 0) return;
    tree.children.splice(footnotesSectionIndex, 1);

    const insertAfter = new Map();

    visitParents(
      tree,
      (node) => node.type === 'element' && node.tagName === 'a' && node.properties?.dataFootnoteRef !== undefined,
      (node, ancestors) => {
        const rootBlock = ancestors[1] ?? ancestors[ancestors.length - 1];
        if (!rootBlock || rootBlock === tree) return;
        const fnId = String(node.properties.href ?? '').replace(/^#/, '');
        if (!footnoteContent.has(fnId)) return;
        const refId = typeof node.properties.id === 'string' ? node.properties.id : fnId.replace('-fn-', '-fnref-');
        const list = insertAfter.get(rootBlock) ?? [];
        list.push({ refId, fnId, number: node.children, refNode: node });
        insertAfter.set(rootBlock, list);
      }
    );

    if (insertAfter.size === 0) return;

    const newChildren = [];
    for (const child of tree.children) {
      newChildren.push(child);
      const notes = insertAfter.get(child);
      if (!notes) continue;
      for (const { refId, fnId, number, refNode } of notes) {
        const noteNumber = fnId.match(/-(\d+)$/)?.[1];
        const asideId = `mn-${noteNumber ?? refId}`;
        refNode.properties.href = `#${asideId}`;
        delete refNode.properties.ariaDescribedBy;
        newChildren.push({
          type: 'element',
          tagName: 'aside',
          properties: {
            className: ['margin-note'],
            id: asideId,
            'data-ref-id': refId,
          },
          children: [
            {
              type: 'element',
              tagName: 'span',
              properties: { className: ['margin-note__number'], 'aria-hidden': 'true' },
              children: number,
            },
            {
              type: 'element',
              tagName: 'span',
              properties: { className: ['margin-note__label'] },
              children: [{ type: 'text', value: `Note ${noteNumber ?? ''}` }],
            },
            {
              type: 'element',
              tagName: 'span',
              properties: { className: ['margin-note__body'] },
              children: footnoteContent.get(fnId),
            },
          ],
        });
      }
    }
    tree.children = newChildren;
  };
}

function stripBackrefs(nodes) {
  const clean = [];
  for (let node of nodes) {
    if (node.type === 'element' && node.properties?.dataFootnoteBackref !== undefined) continue;
    if (node.type === 'element' && node.children) {
      node = { ...node, children: stripBackrefs(node.children) };
    }
    clean.push(node);
  }
  while (clean.length && clean[clean.length - 1].type === 'text' && /^\s+$/.test(clean[clean.length - 1].value)) {
    clean.pop();
  }
  return clean;
}
