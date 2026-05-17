export const formatCypherpunkDate = (epochMs: number) => {
  const d = new Date(epochMs);
  return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
};
