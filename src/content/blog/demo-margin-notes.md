---
title: "Demo: Margin Notes"
date: 2026-01-01
tags: ["demo"]
language: en
draft: false
demo: true
description: "A demo post proving the margin-note system: normal footnote spacing, positioned next to its reference line."
---

This is a demo post, not real content — it exists only to prove that the margin-note system works before real writing gets migrated onto it. Ordinary Markdown footnote syntax produces a note in the right margin on wide screens, aligned to the line that references it.[^1]

Here is a second paragraph with a footnote of its own, further down the page, so the collision logic has more than one note to place.[^2] The two notes above are spaced normally — nothing should overlap, and nothing should need to stack.

A third note, near the end of the post, closes things out.[^3] On a narrow screen, none of these notes should be visible until you tap the small superscript number next to the text that refers to it — and tapping it again should collapse the note back down without jumping anywhere on the page.

[^1]: The first note. It should sit roughly level with the sentence above, in the margin, on screens wider than about 1100px.
[^2]: The second note, further down the page than the first — testing that notes track their own reference point rather than all clustering at the top.
[^3]: The third and last note in this demo. Footnote text supports *emphasis*, and [links](/writing), as required by the brief.
