// 手写 apply
Function.prototype.myApply = function (ctx, argsArr) {
  ctx = (ctx === null || ctx === undefined) ? globalThis : Object(ctx);
  const key = Symbol("temp");
  Object.defineProperty(ctx, key, {
    configurable: true,
    enumerable: false,
    value: this
  });
  if (!Array.isArray(argsArr)) return ctx[key]();

  const res = ctx[key](...argsArr);
  delete ctx[key];
  return res;
}

function method(a, b) {
  console.log(this, a, b);
  return a + b;
}
method.myApply({}, [2, 3]);