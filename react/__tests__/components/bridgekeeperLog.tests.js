import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BridgekeeperLog } from '../../src/components/modals/bridgekeeper/bridgekeeper.render';
import {
  appendBridgekeeperLogEntry,
  formatBridgekeeperLogEntry
} from '../../src/components/modals/bridgekeeper/bridgekeeper.log';

it('preserves log line breaks without converting HTML-like text to markup', () => {
  const payload = '<img src=x onerror="window.bridge.getSecretSync()">';
  const logData = appendBridgekeeperLogEntry(
    appendBridgekeeperLogEntry(null, payload),
    '<script>alert(1)</script>'
  );
  const markup = renderToStaticMarkup(<BridgekeeperLog logData={logData} />);

  expect(logData).toBe(`${payload}\n<script>alert(1)</script>\n`);
  expect(markup).toContain('&lt;img');
  expect(markup).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  expect(markup).not.toContain('<img');
  expect(markup).not.toContain('<script>');
});

it('retains structured log formatting as plain text', () => {
  const entry = { message: '<b>not bold</b>', status: 'running' };

  expect(formatBridgekeeperLogEntry(entry)).toBe(JSON.stringify(entry, undefined, 2));
});
