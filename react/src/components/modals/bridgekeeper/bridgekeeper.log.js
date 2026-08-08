export const formatBridgekeeperLogEntry = (entry) => {
  if (typeof entry === 'object') {
    return JSON.stringify(entry, undefined, 2);
  }

  return String(entry);
};

export const appendBridgekeeperLogEntry = (logData, entry) => {
  const currentLog = logData == null ? '' : logData;

  return `${currentLog}${formatBridgekeeperLogEntry(entry)}\n`;
};
