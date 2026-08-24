// iframe 内 console 劫持：把 console 输出结构化转发给父页面
// 设计目标：
//   1. 参数可序列化（处理循环引用、函数、Symbol、BigInt 等）
//   2. 携带日志类型和时间戳，供父页面 Console 面板分级展示
//   3. 保留原始 console 行为（同源 iframe，origin 指向父页面，直接调用即可）

(function () {
  function stringify(value, seen, depth) {
    // 限制递归深度，避免极深对象拖垮主线程
    if (depth > 12) return '[Depth Limit]';

    if (value === null) return null;
    const t = typeof value;

    if (t === 'function') return `[Function: ${value.name || 'anonymous'}]`;
    if (t === 'symbol') return value.toString();
    if (t === 'bigint') return `${value.toString()}n`;
    if (t === 'undefined') return 'undefined';

    // 数字 / 字符串 / 布尔 直接返回；NaN/Infinity 给可读形式
    if (t === 'number') {
      if (Number.isNaN(value)) return 'NaN';
      if (value === Infinity) return 'Infinity';
      if (value === -Infinity) return '-Infinity';
      return value;
    }
    if (t === 'string' || t === 'boolean') return value;

    // 对象 / 数组
    if (t === 'object') {
      if (seen.has(value)) return '[Circular]';

      // 常见内建类型转可读字符串
      if (value instanceof Date) return value.toISOString();
      if (value instanceof RegExp) return value.toString();
      if (value instanceof Error) return `${value.name}: ${value.message}`;
      if (value instanceof Map) {
        seen.add(value);
        const entries = [];
        value.forEach((v, k) => entries.push([stringify(k, seen, depth + 1), stringify(v, seen, depth + 1)]));
        seen.delete(value);
        return { __type: 'Map', entries };
      }
      if (value instanceof Set) {
        seen.add(value);
        const items = [];
        value.forEach((v) => items.push(stringify(v, seen, depth + 1)));
        seen.delete(value);
        return { __type: 'Set', items };
      }

      seen.add(value);
      if (Array.isArray(value)) {
        const arr = value.map((item) => stringify(item, seen, depth + 1));
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
    return args.map((arg) => stringify(arg, seen, 0));
  }

  function overrideConsole(type) {
    const origin = console[type];
    if (typeof origin !== 'function') return;
    console[type] = function (...args) {
      try {
        parent.postMessage(
          {
            from: 'iframe',
            type,
            args: safeSerialize(args),
            timestamp: Date.now(),
          },
          '*'
        );
      } catch (e) {
        // 序列化失败时降级为字符串
        try {
          parent.postMessage(
            { from: 'iframe', type, args: args.map((a) => String(a)), timestamp: Date.now() },
            '*'
          );
        } catch (_) { /* ignore */ }
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
