/**
 * Maps API market names to display labels. Edit here for client-side renames.
 */
export function formatMarketDisplayName(name) {
  if (name == null || name === '') return name
  return String(name).replace(/\b7[\s-]*star\b/gi, 'Shree')
}
