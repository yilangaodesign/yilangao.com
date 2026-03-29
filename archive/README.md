# Archive

Cold storage for explored-but-shelved code. Everything here was tried during an
experiment, found to not fit the current direction, and preserved for future
reference.

**Agents**: Do NOT reference files in this directory unless explicitly asked.
Active code lives in `src/`. Consult the archive only when the user asks to
revisit past explorations.

## Structure

```
archive/
  experiment-01/     Artifacts shelved from the experiment-01 branch
  experiment-02/     Artifacts shelved from the experiment-02 branch
  shared/            Design system explorations not tied to a single experiment
    tokens/          Color palettes, type scales, etc. that were tried but not adopted
    components/      Generic components explored but not kept
```

## Convention

When archiving a file:

1. Move it from `src/` into the appropriate `archive/experiment-XX/` or
   `archive/shared/` subdirectory.
2. Add a brief comment block at the top of the file:
   - What the file was (e.g. "Horizontal auto-scrolling testimonial carousel").
   - Which experiment branch it originated on.
   - Why it was shelved (e.g. "Replaced by a static grid layout in experiment-03").
3. Keep the original filename so it's easy to find later.
