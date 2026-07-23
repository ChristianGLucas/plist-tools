# plist-tools

Deterministic parsing and inspection of Apple Property List (plist) files —
both the XML plist format and the binary plist (bplist00) format. Built for
macOS/iOS development tooling: Info.plist, entitlements, provisioning
profiles, preferences, LaunchAgents.

Built for the [Axiom](https://axiomide.com) marketplace, published as
`christiangeorgelucas/plist-tools`.

## Use it from your agent or app

Every node in this package is a **live, auto-scaling API endpoint** on the
[Axiom](https://axiomide.com) marketplace — call it from an AI agent or your own
code, with nothing to self-host.

**📦 See it on the marketplace:**
https://dev.axiomide.com/marketplace/christiangeorgelucas/plist-tools@0.1.0

**Hook it up to an AI agent (MCP).** Add Axiom's hosted MCP server to any MCP
client and every node becomes a typed tool your agent can call — search the
catalog, inspect a schema, and invoke it directly.

```bash
# Claude Code
claude mcp add --transport http axiom https://api.axiomide.com/mcp \
  --header "Authorization: Bearer $AXIOM_API_KEY"
```

Claude Desktop, Cursor, or any config-based client:

```json
{
  "mcpServers": {
    "axiom": {
      "type": "http",
      "url": "https://api.axiomide.com/mcp",
      "headers": { "Authorization": "Bearer YOUR_AXIOM_API_KEY" }
    }
  }
}
```

**Call it from the CLI.**

```bash
axiom invoke christiangeorgelucas/plist-tools/DetectFormat --input '{ ... }'
```

**Call it over HTTP.**

```bash
curl -X POST https://api.axiomide.com/invocations/v1/nodes/christiangeorgelucas/plist-tools/0.1.0/DetectFormat \
  -H "Authorization: Bearer $AXIOM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ ... }'
```

> Input/output schema for each node is on the marketplace page above, or via
> `axiom inspect node christiangeorgelucas/plist-tools/DetectFormat`.

### Get started free

Install the CLI:

```bash
# macOS / Linux — Homebrew
brew install axiomide/tap/axiom

# macOS / Linux — install script
curl -fsSL https://raw.githubusercontent.com/AxiomIDE/axiom-releases/main/install.sh | sh
```

**Windows:** download the `windows/amd64` `.zip` from the
[releases page](https://github.com/AxiomIDE/axiom-releases/releases), unzip it,
and put `axiom.exe` on your `PATH`.

Then `axiom version` to verify, `axiom login` (GitHub or Google) to authenticate,
and create an API key under **Console → API Keys**. Docs and sign-up at
**[axiomide.com](https://axiomide.com)**.

## What it does

Every node is a pure, stateless, single-input-to-single-output transform
over a canonical typed `PlistValue` tree that mirrors Apple's own plist type
model (STRING, INTEGER, REAL, BOOLEAN, DATE, DATA, DICT, ARRAY). The plist is
always supplied by the caller as text or bytes — no filesystem, no network,
no wall clock, no randomness.

### Nodes

- **DetectFormat** — XML vs binary vs unknown, from magic bytes.
- **ParseXml** / **ParseBinary** — parse into the canonical `PlistValue` tree.
- **SerializeXml** — serialize a tree back to XML plist text.
- **GetValueAtPath** — dotted key-path lookup (`CFBundleURLTypes.0.CFBundleURLSchemes.0`).
- **ExtractKey** — single-level dict key extraction (handles literal `.` in a key).
- **ListTopLevelKeys** — top-level dict keys, in source order.
- **GetValueType** — the `PlistType` of a value.
- **ListAllKeysRecursive** — every key path in the document, flattened.
- **ExtractValuesByType** — every value of a given type, with its path.
- **ConvertToJson** / **JsonToXml** — JSON conversion, both directions.
- **GetInfoPlistSummary** — common Info.plist fields (bundle id/version/name,
  URL schemes, `NS*UsageDescription` keys).
- **ValidatePlist** — well-formedness check with issue reporting.
- **SummarizeStructure** — key counts, nesting depth, per-type breakdown.

## Why a custom parser, not a thin wrapper

The two standard JS libraries for this domain — `plist` (XML) and
`bplist-parser` (binary) — both silently corrupt integers outside limited
ranges: `bplist-parser` returns the wrong value for any 4-byte-width integer
>= 2^31 or any 8-byte-width integer outside the signed 32-bit range (every
negative plist integer is written at 8-byte width, so this is a routine
case, not an edge case), and `plist`'s XML parser loses precision on any
integer beyond 2^53 via `parseInt`. Both are reproduced in this package's
test suite against real, independently-generated (CPython `plistlib`)
fixtures. This package's XML parsing uses `@xmldom/xmldom` directly (with a
corrected, precision-safe DOM walk) and its binary parsing is a from-scratch
implementation, both carrying every integer as an exact base-10 decimal
string rather than a JS number.

## License

MIT — see [LICENSE](./LICENSE).
