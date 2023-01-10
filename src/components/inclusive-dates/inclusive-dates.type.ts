import { ParsingContext } from "chrono-node/dist/chrono";
import { Component } from "chrono-node";
import { ParsingComponents, ParsingResult } from "chrono-node/dist/results";

export type supportedChronoLocales = "en" | "jp" | "fr" | "nl" | "ru" | "pt";

export interface Parser {
  pattern: (context: ParsingContext) => RegExp;
  extract: (
    context: ParsingContext,
    match: RegExpMatchArray
  ) => ParsingComponents | ParsingResult | { [c in Component]?: number } | null;
}
