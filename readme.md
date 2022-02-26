# About

Regex engine written in typescript.

# Features

Engine:
- [x] Ascii literal matching, e.g. `abc123`
- [x] Bracket expressions, e.g. `[abc]` or `[^abc]`
- [x] Greedy matching, e.g. `a*` or `a+`
- [x] Anchors, e.g. `^abc$`
- [x] Supported matchers: `.`, `\b`, `\w`, `\d`, `\s`
- [ ] More matchers, e.g. `\W`
- [ ] Group matching, e.g. `(?:abc)(def)`
- [ ] Optional modifiers, e.g. `abc?`
- [ ] Lazy modifiers, e.g. `a+?`
- [ ] Lookbehind / lookahead, e.g. `abc(?=d)`
- [ ] General modifiers, e.g. `i` for case-insensitive

Other:
- [ ] Hooks for outputting status information during matching
- [ ] Return start end position of match(es)
- [ ] CLI interface
- [ ] Web interface
