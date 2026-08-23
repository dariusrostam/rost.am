import { visitParents } from 'unist-util-visit-parents';

/**
 * Moves GFM footnotes (`[^1]` ... `[^1]: text`) out of the trailing
 * `<section data-footnotes>` block that remark-rehype produces and re-inserts
 * each one as a single `<aside class="margin-note">`, placed as the next
 * sibling right after the top-level block that contains its reference.
 *
 * This is the one canonical DOM location for a note's content — CSS and
 * `margin-notes.js` handle presentation (margin column on wide screens,
 * collapsed-inline toggle on narrow ones); nothing here duplicates content,
 * so no-JS, print, and screen readers all use the same node.
 */
export default function rehypeMarginNotes() {
  return (tree) => {
    const footnoteContent = new Map(); // fnId -> hast children (backref stripped)
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

    // For each reference, find the top-level block (direct child of the
    // document root) that contains it, and queue a note to insert after it.
    const insertAfter = new Map(); // root-level block node -> [{ refId, fnId, number }]

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
        // Point the reference at the relocated note (the old footnote-list
        // target no longer exists) so a no-JS click still lands somewhere
        // useful, and drop the now-meaningless aria-describedby.
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
  // Trailing whitespace-only text node left where the backref used to sit
  while (clean.length && clean[clean.length - 1].type === 'text' && /^\s+$/.test(clean[clean.length - 1].value)) {
    clean.pop();
  }
  return clean;
}
