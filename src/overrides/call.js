// 思路就是把调用的函数作为传入对象的一个方法进行调用（这样 this 就指向该对象）
// 调用完后再将对象上的这个函数删除即可
// 1. 注意传入对象是否为 null 或 undefined，这样 this 指向就为 globalThis
//    否则为传入的 ctx，当然还需要使用 Object(ctx) 进行处理，因为可能传入的是基本类型
// 2. 注意返回值的收集
// ctx 为被绑定的对象
Function.prototype.myCall = function (ctx, ...args) {
  ctx = (ctx === null || ctx === undefined) ? globalThis : Object(ctx);
  var key = Symbol("temp");
  // 原型上方法的 this 为被调用的函数 => 赋值给 ctx 的 Symbol("temp") 属性
  Object.defineProperty(ctx, key, {
    configurable: true,
    enumerable: false,
    value: this
  });

  // fn 的 this 为 ctx
  var result = ctx[key](...args);
  delete ctx[key];
  return result;
}

function method(a, b) {
  console.log(this, a, b);
  return a + b;
}
method.myCall({}, 2, 3);