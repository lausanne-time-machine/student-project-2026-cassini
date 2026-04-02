---
title: Page Structure & Formatting
---

# Page Structure & Formatting

This page explains how Observable Framework pages are structured and how to format content.

---

## Frontmatter

Every page starts with a YAML frontmatter block between `---` delimiters. The two most useful options are `title` and `toc`:

```yaml
---
title: My Page Title
toc: false
---
```

- **`title`** - sets the page title in the browser tab and sidebar
- **`toc: false`** - hides the table of contents (recommended for map-heavy pages)

---

## Markdown Basics

Standard Markdown works as expected:

```markdown
# H1 heading
## H2 heading
### H3 heading

**Bold text**, _italic text_, `inline code`

- Bullet list item
- Another item

1. Numbered item
2. Another item

[Link text](https://example.com)
```

---

## HTML in Markdown

You can embed raw HTML directly in your pages. Observable Framework renders it correctly.

### Callout / Note boxes

Observable Framework provides built-in callout styles:

<div class="tip">

Use `<div class="tip">` for tips and helpful hints.

</div>

<div class="note">

Use `<div class="note">` for general notes or additional context.

</div>

<div class="warning">

Use `<div class="warning">` to highlight important warnings.

</div>

The HTML for these looks like:

```markup
<div class="tip">Your tip here.</div>
<div class="note">Your note here.</div>
<div class="warning">Your warning here.</div>
```

---

## Grid Layouts

Use CSS grid for multi-column layouts. The `grid` class provides a responsive two-column layout:

<div class="grid grid-cols-2">
  <div class="card">
    <h3>Column 1</h3>
    <p>Content goes here. Cards add a subtle background and padding.</p>
  </div>
  <div class="card">
    <h3>Column 2</h3>
    <p>More content here. The layout is responsive and stacks on small screens.</p>
  </div>
</div>

```markup
<div class="grid grid-cols-2">
  <div class="card">
    <h3>Column 1</h3>
    <p>Content goes here.</p>
  </div>
  <div class="card">
    <h3>Column 2</h3>
    <p>More content here.</p>
  </div>
</div>
```

You can also use `grid-cols-3` or `grid-cols-4` for more columns.

---

## Code Blocks

Syntax-highlighted code blocks use triple backticks with a language tag. The special language tags in Observable Framework are:

| Tag | Effect |
|-----|--------|
| ` ```js ` | Reactive JavaScript cell - code **runs** and output is displayed |
| ` ```html ` | **Rendered** HTML - the HTML is inserted into the page |
| ` ```sql ` | SQL query via DuckDB |
| (any other) | Syntax-highlighted, non-executable code block |

<div class="warning">

Code blocks tagged with ` ```js ` are **executed**. Use other language tags (e.g., ` ```javascript `) when you only want to show code without running it. Similarly, ` ```html ` renders HTML directly - use ` ```markup ` to show HTML as code.

</div>

---

## Inline JavaScript Expressions

You can embed reactive JavaScript expressions inline in Markdown text using `${...}`:

```markdown
The current time is ${new Date().toLocaleTimeString()}.
```

Result: The current time is **${new Date().toLocaleTimeString()}**.

---

## Page Structure Summary

A typical page looks like this:

````markdown
---
title: My Visualization
toc: false
---

# My Visualization

Brief description of what this page shows.

## Data

```js
const data = FileAttachment("data/myfile.csv").csv({typed: true})
```

## Chart

```js
Plot.plot({ ... })
```

## Map

<!-- Map HTML container (for Leaflet) -->
<div id="map" style="height: 500px;"></div>

```js
// Map code here
```
````
