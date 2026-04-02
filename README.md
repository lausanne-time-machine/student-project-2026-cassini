# Student Project Template 2026

This is an [Observable Framework](https://observablehq.com/framework/) app. To install the required dependencies, run:

```
npm install
```

Then, to start the local preview server, run:

```
npm run dev
```

Then visit <http://localhost:3000> to preview your app.

For more, see <https://observablehq.com/framework/getting-started>.

## Project structure

```ini
.
├─ .agents
│  └─ skills                   # coding-agent skill files (source of truth)
├─ .claude
│  └─ skills                   # symlinks → .agents/skills/* (for Claude Code)
├─ src
│  ├─ components
│  │  └─ leaflet-heat.js       # Leaflet heatmap plugin bundle
│  ├─ data
│  │  ├─ cadastre-berney.geojson.js   # JS data loader (outputs GeoJSON)
│  │  └─ ...                   # raw data files and loaders
│  ├─ examples                 # worked examples (read-only reference)
│  │  ├─ 01-page-structure.md
│  │  ├─ 02-reactivity.md
│  │  ├─ 03-data-tables.md
│  │  ├─ 04-charts.md
│  │  ├─ 05-maps-leaflet.md
│  │  ├─ 06-maps-historical.md
│  │  ├─ 07-maps-plot.md
│  │  ├─ 08-data-loaders.md
│  │  ├─ 09-venice-landregister.md    # Python loader + Leaflet map
│  │  └─ 10-lausanne-cadastre-renove.md  # complete example (map + table + filter)
│  └─ index.md                 # the home page
├─ .gitignore
├─ AGENTS.md                   # coding-agent instructions (shared)
├─ CLAUDE.md -> AGENTS.md      # symlink for Claude Code
├─ observablehq.config.js      # app config (sidebar navigation, title)
├─ package.json
├─ requirements.txt            # Python dependencies for data loaders
├─ skills-lock.json            # installed agent skills manifest
└─ README.md
```

**`src/index.md`** - The home page for your app. Add your own pages directly in `src/` (e.g. `src/my-analysis.md`).

**`src/data`** - [Data loaders](https://observablehq.com/framework/data-loaders) and static data files. Loader scripts (`.js`, `.py`) are executed at build/preview time; their stdout is cached and accessible via `FileAttachment(“file.ext”)`.

**`src/components`** - Shared JavaScript modules importable from any page.

**`src/examples`** - Worked, runnable examples covering page structure, reactivity, tables, charts, Leaflet maps, historical tile layers, Plot maps, data loaders, and two complete real-dataset examples (Venice 1740 land register via Python loader; Lausanne 1888 cadastre with reactive filtering). Read these for reference; don’t edit them.

**`observablehq.config.js`** - [App configuration](https://observablehq.com/framework/config): sidebar navigation, title, etc. Add new pages here so they appear in the nav.

## Python virtual environment

Python data loaders (files ending in `.py` in `src/data/`) run inside a `.venv/` virtual environment. To set it up:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Observable Framework automatically uses `.venv/bin/python` when executing `.py` data loaders, so you don’t need to activate the environment manually during `npm run dev` or `npm run build`.

Add new Python dependencies to `requirements.txt` and re-run `pip install -r requirements.txt`.

## Coding agent tools

This project ships with configuration for AI coding agents (e.g. Claude Code).

### `AGENTS.md` / `CLAUDE.md`

`AGENTS.md` is the single source of truth for agent instructions: project context, architecture, Observable Framework pitfalls, data patterns, and mapping conventions. `CLAUDE.md` is a symlink to the same file so that Claude Code picks it up automatically.

### Skills (`.agents/skills/`)

Skills are short, focused knowledge files that give the agent deep expertise on a specific library or feature (e.g. `observable-framework-lib-leaflet`, `observable-framework-data-loaders`). They are stored in `.agents/skills/` and listed with their source hashes in `skills-lock.json`.

The skill files themselves are **not tracked in git** — only `skills-lock.json` is. To install or reinstall them after cloning, run:

```bash
npx skills install
```

This reads `skills-lock.json` and downloads the skill files into `.agents/skills/`. To add a new skill or update existing ones:

```bash
npx skills add <skill-name>   # add a specific skill
npx skills update             # update all skills to latest versions
```

See [skills.sh](https://skills.sh/) for full documentation.

### Symlinks for Claude Code (`.claude/skills/`)

Claude Code looks for skills in `.claude/skills/`. Each entry there is a symlink pointing to the corresponding file in `.agents/skills/`, so both tool families share the same skill files without duplication.

## Command reference

| Command           | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `npm install`            | Install or reinstall dependencies                        |
| `npm run dev`        | Start local preview server                               |
| `npm run build`      | Build your static site, generating `./dist`              |
| `npm run deploy`     | Deploy your app to Observable                            |
| `npm run clean`      | Clear the local data loader cache                        |
| `npm run observable` | Run commands like `observable help`                      |
