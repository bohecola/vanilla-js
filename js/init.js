// iframe 内 console 劫持：把 console 输出结构化转发给父页面
// 设计目标：
//   1. 参数可序列化（处理循环引用、函数、Symbol、BigInt、undefined、NaN 等）
//   2. 特殊值用带标记的对象表达（{__type:...}），避免与普通字符串混淆
//   3. 携带日志类型和时间戳，供父页面 Console 面板分级展示
//   4. 保留原始 console 行为（同源 iframe，origin 指向父页面，直接调用即可）

(function () {
  // 特殊值标记：父页面据此渲染成对应类型，而不是当成普通字符串
  function marker(type) {
    return { __type: type };
  }

  function stringify(value, seen, depth) {
    // 限制递归深度，避免极深对象拖垮主线程
    if (depth > 12) return marker('depth');

    if (value === null) return marker('null');

    const t = typeof value;

    if (t === 'function') return { __type: 'function', name: value.name || 'anonymous' };
    if (t === 'symbol') return { __type: 'symbol', desc: value.toString() };
    if (t === 'bigint') return { __type: 'bigint', value: value.toString() };
    if (t === 'undefined') return marker('undefined');

    // 数字特殊值单独标记，避免 NaN/Infinity 与字符串混淆
    if (t === 'number') {
      if (Number.isNaN(value)) return marker('NaN');
      if (value === Infinity) return marker('Infinity');
      if (value === -Infinity) return marker('-Infinity');
      return value;
    }
    if (t === 'string' || t === 'boolean') return value;

    // 对象 / 数组
    if (t === 'object') {
      if (seen.has(value)) return marker('circular');

      // 常见内建类型转可读结构
      if (value instanceof Date) return { __type: 'date', value: value.toISOString() };
      if (value instanceof RegExp) return { __type: 'regexp', value: value.toString() };
      if (value instanceof Error) return { __type: 'error', value: value.name + ': ' + value.message };
      if (value instanceof Map) {
        seen.add(value);
        const entries = [];
        value.forEach((v, k) => entries.push([stringify(k, seen, depth + 1), stringify(v, seen, depth + 1)]));
        seen.delete(value);
        return { __type: 'Map', entries: entries };
      }
      if (value instanceof Set) {
        seen.add(value);
        const items = [];
        value.forEach((v) => items.push(stringify(v, seen, depth + 1)));
        seen.delete(value);
        return { __type: 'Set', items: items };
      }

      seen.add(value);
      if (Array.isArray(value)) {
        const arr = value.map(function (item) { return stringify(item, seen, depth + 1); });
        seen.delete(value);
        return arr;
      }
      const obj = {};
      // 枚举自身属性（含字符串 key），跳过 Object.prototype 上的
      for (const key of Object.keys(value)) {
        obj[key] = stringify(value[key], seen, depth + 1);
      }
      seen.delete(value);
      return obj;
    }

    return String(value);
  }

  function safeSerialize(args) {
    const seen = new Set();
    return args.map(function (arg) { return stringify(arg, seen, 0); });
  }

  function overrideConsole(type) {
    const origin = console[type];
    if (typeof origin !== 'function') return;
    console[type] = function () {
      const args = Array.prototype.slice.call(arguments);
      try {
        parent.postMessage(
          {
            from: 'iframe',
            type: type,
            args: safeSerialize(args),
            timestamp: Date.now(),
          },
          '*'
        );
      } catch (e) {
        // 序列化失败时降级为字符串
        try {
          parent.postMessage(
            { from: 'iframe', type: type, args: args.map(String), timestamp: Date.now() },
            '*'
          );
        } catch (e2) { /* ignore */ }
      }
      // 保留原始输出（同源，直接调 origin，this 绑定 console）
      return origin.apply(console, args);
    };
  }

  overrideConsole('log');
  overrideConsole('info');
  overrideConsole('debug');
  overrideConsole('warn');
  overrideConsole('error');
  overrideConsole('table');
  overrideConsole('time');
  overrideConsole('timeEnd');
})();
