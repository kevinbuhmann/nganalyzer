import * as fs from 'fs';

export interface Config {
  rules: { [ruleName: string]: boolean; };
}

export function getConfig() {
  return JSON.parse(fs.readFileSync('./nganalyzer.json').toString());
}
