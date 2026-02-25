# rust-preferences

Preferences for Rust code in dyreby/* repos:

- **Linting**: `clippy::pedantic`, no warnings allowed.
- **Idiomatic Rust**: Modern, correct, take advantage of new features for readability.
- **Imports**: Everything imported at the top of the module scope. No inline qualified paths (`std::fs::read`, `serde::Serialize`). The reader should see all dependencies at a glance. When importing a module with `self` (e.g., `use std::fs`), use the module path for its items in code (`fs::Metadata`, `fs::read`). Don't also import specific items alongside `self` — pick one level of abstraction.
- **Comments**: Semantic line breaks. Break at sentence boundaries or natural semantic units, not at arbitrary column widths. Each line should be a complete thought. When near a natural wrap point, prefer the semantic break. Otherwise wrap at whatever makes sense or the linter suggests.
- **Comments**: Periods at the end of sentences unless inconsistent within formatting context (e.g., short list items without periods). Short sentence comments get the period.
- **Formatting**: Line breaks between variants and fields that have doc comments.
- **Time**: Prefer `jiff` over `chrono`.
- **Module style**: Modern — `foo.rs` + `foo/` over `foo/mod.rs`.
