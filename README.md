# nganalyzer

`nganalyzer` is a tool for analyzing Angular apps.

## Installation

- `npm install --save-dev nganalyzer`
- `yarn add --dev nganalyzer`

## Usage

- `nganalyzer --help`: display help info
- `nganalyzer --version`: display the installed version
- `nganalyzer [--project ./tsconfig.json]`: lint a project and report failures

## Configuration

Add an `nganalyzer.json` file at the root of your project to configure which rules to run.

```json
{
  "rules": {
    "no-unused-component": true,
    "no-unused-component-binding": true
  }
}
```

## Rules

- `no-usused-component`: reports when a component is not used
- `no-unused-component-bindings`: reports when a component input or output is not used

## Why not use tslint?

These rules could be implemented as `tslint` rules. In fact, I originally did implement them as
`tslint` rules. However, since these rules require the entire application structure to be read,
applying these rules via `tslint` does not work as well. The `tslint-language-service`, for
example, seemed to slow down the editor when applying the rules. Also, you don't get much benefit
from continuously applying these kinds of rules in the editor. Therefore, I thought it would be
best to ship these rules in a separate tool that can be run once when building a project.
