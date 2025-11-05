const clampNumber = (value, min, max) => Math.min(Math.max(value, min), max);

export const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '—';
  }

  if (bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

export const formatDateTime = (isoString) => {
  if (!isoString) {
    return '—';
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleString();
};

export const formatRelativeTime = (isoString) => {
  if (!isoString) {
    return '—';
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const absSeconds = Math.abs(diffSeconds);

  const thresholds = [
    { unit: 'second', value: 60 },
    { unit: 'minute', value: 3600 },
    { unit: 'hour', value: 86400 },
    { unit: 'day', value: 604800 },
  ];

  if (absSeconds < thresholds[0].value) {
    return `${diffSeconds >= 0 ? absSeconds : -absSeconds} sec ${diffSeconds >= 0 ? 'ago' : 'from now'}`;
  }

  if (absSeconds < thresholds[1].value) {
    const minutes = clampNumber(Math.round(diffSeconds / 60), -59, 59);
    return `${Math.abs(minutes)} min ${minutes >= 0 ? 'ago' : 'from now'}`;
  }

  if (absSeconds < thresholds[2].value) {
    const hours = clampNumber(Math.round(diffSeconds / 3600), -23, 23);
    return `${Math.abs(hours)} hr ${hours >= 0 ? 'ago' : 'from now'}`;
  }

  if (absSeconds < thresholds[3].value) {
    const days = clampNumber(Math.round(diffSeconds / 86400), -6, 6);
    return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ${days >= 0 ? 'ago' : 'from now'}`;
  }

  return date.toLocaleDateString();
};

export const shortHash = (hash, visible = 8) => {
  if (!hash || typeof hash !== 'string') {
    return '—';
  }
  if (hash.length <= visible * 2) {
    return hash;
  }
  return `${hash.slice(0, visible)}…${hash.slice(-visible)}`;
};
