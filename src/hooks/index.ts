const modules = import.meta.glob(
  ['../template/**/*.js', '!**/data/index.js'],
  { query: '?raw', import: 'default' }
)

export function useTemplate() {
  return modules
}