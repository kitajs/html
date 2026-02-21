---
name: information-mapping
description:
  Information Mapping (Structured Writing) methodology for technical documentation. Use
  when writing, reviewing, or planning documentation pages.
user-invocable: false
---

# Information Mapping Methodology

You are applying Robert Horn's Information Mapping (Structured Writing) methodology to
technical documentation. Follow these rules strictly.

## Six Information Types

Every page or document unit must be assigned exactly one type. Never mix types within a
single page.

| Type      | Purpose                                | Contains                                                    | Never contains                               |
| --------- | -------------------------------------- | ----------------------------------------------------------- | -------------------------------------------- |
| Concept   | What something is, why it matters      | Definitions, explanations, comparisons, positioning         | Numbered steps, API signatures, benchmarks   |
| Procedure | How to do something step-by-step       | Sequential instructions, code examples showing usage        | Internal mechanism details, design rationale |
| Process   | How something works internally         | Data flow, mechanism descriptions, stage-by-stage breakdown | "Do this, then do that" user instructions    |
| Principle | Rules, guidelines, design decisions    | Rationale, constraints, trade-offs, recommendations         | Setup steps, API signatures                  |
| Structure | API references, component organization | Signatures, parameters, return types, minimal examples      | Design philosophy, tutorials                 |
| Fact      | Data, measurements, specifications     | Tables, benchmarks, version numbers, compatibility data     | Opinions, instructions, rationale            |

## Core Principles

**Chunking**: Break content into small, manageable units. Each page addresses one tightly
scoped topic. Target 200-800 words per page. Larger pages are acceptable only when the
subject density requires it.

**Relevance**: Every sentence on a page must relate to that page's single topic. If
content belongs to another topic, move it to the appropriate page and link to it.

**Labelling**: Give every page a concrete, descriptive title. Concept pages use noun
phrases ("Async Components"). Procedure pages use action-oriented phrases ("Using
Suspense", "Getting Started"). Process pages use "How X Works" phrasing. Structure pages
use the module/API name. Fact pages use the data category ("Benchmarks", "Compatibility").

**Consistency**: All pages of the same type follow the same internal structure and
formatting conventions.

**No type mixing**: This is the most important rule. A Concept page never contains
numbered setup steps. A Procedure page never explains internal mechanisms. A Structure
page never contains design rationale. If you find yourself mixing types, split the content
into separate pages.

## Applying the Methodology

When writing a new page:

1. Determine the single information type before writing any content
2. Write a title that reflects the type (see Labelling above)
3. Keep all content within the boundaries of that type
4. If you need to reference content of another type, link to it rather than including it
   inline
5. Review the completed page and verify no type mixing occurred

When reviewing existing pages:

1. Identify what information type the page should be
2. Flag any content that belongs to a different type
3. Suggest splitting mixed-type pages into separate focused pages

When planning a documentation structure:

1. List all topics that need documentation
2. Assign each topic an information type
3. Order pages within sections so that Concepts come before Procedures (understand before
   do), with Process and Principle pages providing depth for those who need it
4. Place Structure (API reference) and Fact (data) pages in dedicated reference sections
