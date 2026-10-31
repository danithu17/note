import React from 'react';

/**
 * Lightweight, zero-dependency code syntax highlighter.
 * Generates highlighted React elements with token classes for keywords,
 * strings, numbers, booleans, and comments across TS, JS, Python, C++, Java, Rust, SQL, Bash.
 */
export function highlightCodeSyntax(code: string, language: string = ''): React.ReactNode {
  const lines = code.split('\n');

  return lines.map((line, lineIdx) => {
    return (
      <div key={`line-${lineIdx}`} className="table-row">
        <span className="table-cell select-none pr-4 text-right text-slate-600 dark:text-slate-500 font-mono text-[11px] opacity-70">
          {lineIdx + 1}
        </span>
        <span className="table-cell whitespace-pre">
          {tokenizeLine(line, language.toLowerCase())}
        </span>
      </div>
    );
  });
}

function tokenizeLine(line: string, lang: string): React.ReactNode {
  if (!line) return ' ';

  // Regex patterns
  const commentPattern =
    lang === 'python' || lang === 'bash' || lang === 'shell'
      ? /(#.*$)/
      : lang === 'sql'
        ? /(--.*$)/
        : /(\/\/.*$)/;

  const commentMatch = line.match(commentPattern);
  let codePart = line;
  let commentPart = '';

  if (commentMatch && commentMatch.index !== undefined) {
    codePart = line.slice(0, commentMatch.index);
    commentPart = line.slice(commentMatch.index);
  }

  // Tokenize the codePart
  const tokens = codePart.split(/([a-zA-Z_$][a-zA-Z0-9_$]*|"[^"]*"|'[^']*'|`[^`]*`|\d+(?:\.\d+)?|[^\w\s])/g);

  const keywords = new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
    'import', 'from', 'export', 'as', 'default', 'class', 'extends', 'implements',
    'interface', 'type', 'enum', 'public', 'private', 'protected', 'static', 'readonly',
    'async', 'await', 'yield', 'try', 'catch', 'finally', 'throw', 'new', 'typeof',
    'instanceof', 'in', 'of', 'def', 'elif', 'pass', 'lambda', 'with', 'global',
    'fn', 'mut', 'pub', 'struct', 'impl', 'trait', 'match', 'use', 'crate',
    'select', 'from', 'where', 'insert', 'into', 'values', 'update', 'set', 'delete',
    'join', 'group', 'by', 'order', 'having', 'limit', 'union', 'create', 'table',
  ]);

  const booleans = new Set(['true', 'false', 'null', 'undefined', 'None', 'True', 'False', 'nil']);
  const types = new Set([
    'string', 'number', 'boolean', 'any', 'void', 'never', 'unknown', 'object',
    'int', 'float', 'double', 'char', 'bool', 'str', 'list', 'dict', 'set', 'tuple',
    'i32', 'i64', 'u32', 'u64', 'f32', 'f64', 'usize', 'Vec', 'String', 'Option', 'Result',
  ]);

  const renderedTokens = tokens.map((token, idx) => {
    if (!token) return null;

    // String literals
    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'")) ||
      (token.startsWith('`') && token.endsWith('`'))
    ) {
      return (
        <span key={idx} className="text-emerald-400 dark:text-emerald-300">
          {token}
        </span>
      );
    }

    // Number literals
    if (/^\d+(?:\.\d+)?$/.test(token)) {
      return (
        <span key={idx} className="text-amber-400 dark:text-amber-300">
          {token}
        </span>
      );
    }

    // Keywords
    if (keywords.has(token)) {
      return (
        <span key={idx} className="text-purple-400 dark:text-purple-300 font-semibold">
          {token}
        </span>
      );
    }

    // Booleans & Null
    if (booleans.has(token)) {
      return (
        <span key={idx} className="text-rose-400 font-medium">
          {token}
        </span>
      );
    }

    // Types
    if (types.has(token)) {
      return (
        <span key={idx} className="text-cyan-400 dark:text-cyan-300">
          {token}
        </span>
      );
    }

    // Operators & Punctuation
    if (/^[=+\-*/%&|^!~<>?:;,.]/.test(token)) {
      return (
        <span key={idx} className="text-sky-400">
          {token}
        </span>
      );
    }

    return <span key={idx}>{token}</span>;
  });

  return (
    <>
      {renderedTokens}
      {commentPart && (
        <span className="text-slate-500 italic">
          {commentPart}
        </span>
      )}
    </>
  );
}
