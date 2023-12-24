function overrideConsole(type) {
  const origin = console[type];
  console[type] = (...args) => {
    parent.postMessage({
      from: "iframe",
      type,
      args: args
    });
    origin.apply(console, args);
  }
}

overrideConsole('log');
overrideConsole('info');
overrideConsole('debug');
overrideConsole('warn');
overrideConsole('error');
overrideConsole('table');
overrideConsole('time');
overrideConsole('timeEnd');