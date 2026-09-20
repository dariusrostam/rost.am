---
title: "Machine-Readable Opt-Outs in Kneschke vs LAION"
date: 2024-12-28
tags: ["ai", "copyright"]
language: en
draft: false
description: "On machine-readable opt-outs and the Hamburg court's reasoning in Kneschke v LAION."
---

## A Fundamental Decision on AI Training?

The decision in Kneschke ./. LAION e.V. by the Hamburg Regional Court ([German version](https://openjur.de/u/2495651.html)) has received quite some attention in copyright circles and beyond. Contrary to some takes, however, it does not address whether [Article 4 DSM Directive](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32019L0790&from=EN#art_4) applies to AI training. Rather, LAION reproduced an image to check whether an existing image description (taken from the Common Crawl dataset) matched the actual content of the image when creating the dataset LAION-5B in the form of a collection of links.

The question was whether LAION can rely on the limitation concerning text and data mining for the purposes of scientific research under [Article 3 DSM Directive](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32019L0790&from=EN#art_3), transposed in [Section 60(d) of the German Act on Copyright and Related Rights](https://www.gesetze-im-internet.de/englisch_urhg/englisch_urhg.html#p0486). For this, LAION has to be a "research organisation", which — at least regarding the court's reasoning — is doubtful.

However, this is only a side issue here. Instead, what I find more intriguing is the court's extensive obiter dictum on opt-outs under [Article 4(3) DSM Directive](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32019L0790&from=EN#art_4) and [Section 44b(3) German Act on Copyright and Related Rights](https://www.gesetze-im-internet.de/englisch_urhg/englisch_urhg.html#p0328).

## Opt-outs in Copyright

Opt-out regimes have become increasingly common in copyright. Structurally, they represent a proceduralization of the exclusive right granted under copyright law: whether exclusivity exists depends on a process initiated by the rightsholder. If the rightsholder remains inactive, use is generally permitted (some people therefore speak of copyright law "turned on its head").

Users, such as AI companies, are therefore relieved of the transaction costs they would otherwise bear under an initially exclusive right. In the case of AI training, these are prohibitively high because of the sheer volume of content. Meanwhile, rightsholders bear additional costs for declaring an opt-out. However, this shift in the cost can be worthwhile if it enables negotiations and a market-based solution for the allocation of rights to use the content. More on this can be found [here](/research/technikverstaendliches-verhalten/).

For online content, the DSM Directive requires that an opt-out be declared using machine-readable means. [Article 4(3)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32019L0790&from=EN#art_4) states:

> The exception or limitation provided for in paragraph 1 shall apply on condition that the use of works and other subject matter referred to in that paragraph has not been expressly reserved by their rightholders in an appropriate manner, such as machine-readable means in the case of content made publicly available online.

To determine the appropriateness of an opt-out, the interests of users (the easier to detect, the better) and rightsholders (the easier to declare, the better) must be balanced. Users can without further ado be required to employ all available and reasonable means to detect an opt-out. Conversely, rightsholders can reasonably be expected to declare their opt-out in a way that enables automated detection, as otherwise users would not use content — they would need to refrain from any use out of uncertainty about whether an opt-out was declared, since if they cannot license every piece of content because of the high volume, they cannot check it manually for an opt-out either. The provision on machine-readable means in [Article 4(3) DSM Directive](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32019L0790&from=EN#art_4) is based on this idea.

## What about LAION?

In the LAION case, the reproduced image in question, hosted on a stock photo platform, was subject to a general, *plain-language* opt-out included in the website's terms of use. Nonetheless, the court found that this satisfied the requirements for machine-readability. The rationale was that LAION, in analyzing the images for their correlation with the image tag, was able to "understand" the (plain-language) image tag. Whether this implies that LAION also had the means to detect and interpret entirely unknown opt-outs across the web — an entirely different technical endeavour — seems very dubious to me, but is ultimately a question of fact.

However, the court's reasoning suffers from a more fundamental flaw: it takes only the technical means of users to detect and understand the opt-out into account, and completely ignores the range of options available to rightsholders for declaring the opt-out. This is problematic in light of the DSM Directive's requirement for the opt-out to be appropriate: the purpose of the limitation in [Article 4](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32019L0790&from=EN#art_4) is to eliminate legal uncertainty for users regarding the lawfulness of text and data mining. For this reason, the reservation must be appropriate to ensure users are not exposed to an undue risk of copyright infringement. The Directive notably does not require that the burden on rightsholders is minimized to the greatest extent possible.

Therefore, it is insufficient to consider only whether users have technical means to detect a given opt-out; it is equally important to assess what machine-readable means can reasonably be expected from rightsholders to make use of when declaring an opt-out. If rightsholders can declare an opt-out with minimal (extra) effort in a certain way that results in a significant reduction of users' burden (e.g., by making it especially easy or resource-efficient to detect), there would have to be good reasons why they should not be required to do so.

For the upcoming appeal, it will therefore be interesting to observe whether the arguments regarding machine-readability are upheld, should they arise at all.

Linda Kuschel and I delve into these issues in more detail in [our comments on the LAION decision by the Hamburg Regional Court](/research/vervielfaeltigungen-datensatz-zum/).
