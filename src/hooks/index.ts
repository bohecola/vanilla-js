const modules = import.meta.glob(['../template/**/*.js', '!**/data/index.js'], { as: "raw" })

export function useTemplate() {
  return modules
}