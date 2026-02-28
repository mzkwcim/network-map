# Contributing

Thanks for taking a look — contributions are welcome.

## Quick rules
- **Do not commit secrets** (tokens, keys, private URLs, real internal IPs).
- Keep changes **small and well-scoped**.
- If you change behavior, update **README** and/or mention it clearly in the PR description.

## Local development
This is a static project (no build step required).

Run locally:
```bash
cd src
python -m http.server 8080
# open http://localhost:8080
```

## Data changes (`src/data/*.json`)
When editing topology/flows:
- Every `edge.from` and `edge.to` must reference an existing `node.id`
- Keep labels human-readable
- Prefer **masked** addresses for public demos (avoid leaking real internal details)

Validate data locally:
```bash
node scripts/validate-data.mjs
```

## Pull requests
Please include:
- what changed
- why it changed
- how to test (steps)
- screenshot (optional but helpful)

## Style
- Keep HTML/CSS readable and consistent with existing patterns
- Avoid adding heavy dependencies unless necessary
