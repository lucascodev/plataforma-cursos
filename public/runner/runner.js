'use strict';

// Runs code that comes with a course (written by teachers and students) away from the app. The app loads this page in an
// iframe with sandbox="allow-scripts" and no allow-same-origin: the page has an opaque origin, so it never sees the
// session cookies and its requests to /api are refused as cross-site. The code itself runs in a Worker that is
// terminated when it takes too long.
(function runner() {
  var ORIGIN = new URL(location.href).origin;
  var LOAD_TIMEOUT_MS = 90000;
  var DEFAULT_RUN_TIMEOUT_MS = 10000;
  var workers = {};

  function workerMain() {
    var origin = '';
    var python = null;
    var sqlJs = null;

    function message(error) {
      return error && error.message ? String(error.message) : String(error);
    }

    function loadPython() {
      if (python) return python;
      importScripts(origin + '/pyodide/pyodide.js');
      python = self.loadPyodide({ indexURL: origin + '/pyodide/' });
      return python;
    }

    function loadSql() {
      if (sqlJs) return sqlJs;
      importScripts(origin + '/sqljs/sql-wasm.js');
      sqlJs = self.initSqlJs({ locateFile: function (file) { return origin + '/sqljs/' + file; } });
      return sqlJs;
    }

    var PY_HARNESS = [
      'import json, os, shutil, sys',
      'def __reset(files):',
      '    root = "/home/pyodide/exercicio"',
      '    os.chdir("/home/pyodide")',
      '    shutil.rmtree(root, ignore_errors=True)',
      '    os.makedirs(root)',
      '    for name, content in files.items():',
      '        with open(os.path.join(root, name), "w", encoding="utf-8") as handle:',
      '            handle.write(content)',
      '    os.chdir(root)',
      '    if root not in sys.path:',
      '        sys.path.insert(0, root)',
      '    for name in files:',
      '        sys.modules.pop(name.rsplit(".", 1)[0], None)',
      'def __outcome(fn):',
      '    try:',
      '        fn()',
      '        return [True, ""]',
      '    except AssertionError as error:',
      '        return [False, str(error) or "O teste falhou."]',
      '    except Exception as error:',
      '        return [False, type(error).__name__ + ": " + str(error)]',
      'def __run_tests(files, source):',
      '    __reset(files)',
      '    namespace = {"__name__": "__tests__"}',
      '    try:',
      '        exec(compile(source, "testes.py", "exec"), namespace)',
      '    except Exception as error:',
      '        return json.dumps({"error": type(error).__name__ + ": " + str(error), "results": []})',
      '    results = []',
      '    for name, value in list(namespace.items()):',
      '        if name.startswith("test_") and callable(value):',
      '            passed, detail = __outcome(value)',
      '            results.append({"id": name, "passed": passed, "message": detail})',
      '    return json.dumps({"error": None, "results": results})',
      'def __run_checks(files, checks):',
      '    __reset(files)',
      '    results = []',
      '    for check in checks:',
      '        namespace = {"__name__": "__check__"}',
      '        passed, detail = __outcome(lambda: exec(compile(check["test"], check["id"] + ".py", "exec"), namespace))',
      '        results.append({"id": check["id"], "passed": passed, "message": detail})',
      '    return json.dumps({"error": None, "results": results})',
    ].join('\n');

    async function runPython(job) {
      var pyodide = await loadPython();
      self.postMessage({ type: 'started' });
      var output = [];
      pyodide.setStdout({ batched: function (line) { output.push(line); } });
      pyodide.setStderr({ batched: function (line) { output.push(line); } });
      pyodide.runPython(PY_HARNESS);
      var files = pyodide.toPy(job.files || {});
      var raw =
        job.mode === 'tests'
          ? pyodide.globals.get('__run_tests')(files, job.tests || '')
          : pyodide.globals.get('__run_checks')(files, pyodide.toPy(job.checks || []));
      var parsed = JSON.parse(raw);
      return { results: parsed.results, error: parsed.error, output: output.join('\n') };
    }

    function runJavascript(job) {
      self.postMessage({ type: 'started' });
      var output = [];
      var fakeConsole = {
        log: function () { output.push(Array.prototype.map.call(arguments, String).join(' ')); },
      };
      fakeConsole.error = fakeConsole.log;
      fakeConsole.warn = fakeConsole.log;
      function assert(condition, text) {
        if (!condition) throw new Error(text || 'A condição esperada não aconteceu.');
      }
      function assertEqual(actual, expected, text) {
        var got = JSON.stringify(actual);
        var want = JSON.stringify(expected);
        if (got !== want) throw new Error(text || 'Esperado ' + want + ', recebido ' + got + '.');
      }
      var source = Object.keys(job.files || {}).map(function (name) { return job.files[name]; }).join('\n;\n');
      var results = [];
      function test(name, fn) {
        try {
          fn();
          results.push({ id: String(name), passed: true, message: '' });
        } catch (error) {
          results.push({ id: String(name), passed: false, message: message(error) });
        }
      }
      if (job.mode === 'tests') {
        try {
          new Function('test', 'assert', 'assertEqual', 'console', source + '\n;\n' + (job.tests || ''))(test, assert, assertEqual, fakeConsole);
        } catch (error) {
          return { results: results, error: message(error), output: output.join('\n') };
        }
        return { results: results, error: null, output: output.join('\n') };
      }
      (job.checks || []).forEach(function (check) {
        test(check.id, function () {
          new Function('assert', 'assertEqual', 'console', source + '\n;\n' + check.test)(assert, assertEqual, fakeConsole);
        });
      });
      return { results: results, error: null, output: output.join('\n') };
    }

    async function runSql(job) {
      var SQL = await loadSql();
      self.postMessage({ type: 'started' });
      var db = new SQL.Database();
      var source = Object.keys(job.files || {}).map(function (name) { return job.files[name]; }).join('\n;\n');
      try {
        db.run(source);
      } catch (error) {
        db.close();
        return { results: [], error: message(error), output: '' };
      }
      var blocks = (job.tests || '').split(/^--\s*test:\s*/m).filter(function (block) { return block.trim(); });
      var results = blocks.map(function (block) {
        var newline = block.indexOf('\n');
        var name = (newline === -1 ? block : block.slice(0, newline)).trim();
        var query = newline === -1 ? '' : block.slice(newline + 1);
        try {
          var rows = db.exec(query);
          var value = rows.length && rows[0].values.length ? rows[0].values[0][0] : null;
          var passed = value === 1 || value === true || value === '1';
          return { id: name, passed: passed, message: passed ? '' : 'A consulta do teste não devolveu 1.' };
        } catch (error) {
          return { id: name, passed: false, message: message(error) };
        }
      });
      db.close();
      return { results: results, error: null, output: '' };
    }

    var RUNNERS = { python: runPython, javascript: runJavascript, sql: runSql };

    self.onmessage = async function (event) {
      var data = event.data || {};
      if (data.type === 'init') {
        origin = data.origin;
        return;
      }
      if (data.type !== 'run') return;
      try {
        var result = await RUNNERS[data.job.language](data.job);
        self.postMessage({ type: 'result', result: result });
      } catch (error) {
        self.postMessage({ type: 'result', result: { results: [], error: message(error), output: '' } });
      }
    };
  }

  function createWorker() {
    var source = '(' + workerMain.toString() + ')();';
    var worker = new Worker(URL.createObjectURL(new Blob([source], { type: 'text/javascript' })));
    worker.postMessage({ type: 'init', origin: ORIGIN });
    return worker;
  }

  function reply(id, result) {
    window.parent.postMessage({ type: 'runner-result', id: id, result: result }, '*');
  }

  function run(id, job) {
    var worker = workers[job.language] || (workers[job.language] = createWorker());
    var timer = setTimeout(stop, LOAD_TIMEOUT_MS, 'O ambiente demorou demais para carregar. Confira a conexão e tente de novo.');

    function stop(text) {
      worker.terminate();
      delete workers[job.language];
      reply(id, { results: [], error: text, output: '' });
    }

    worker.onmessage = function (event) {
      var data = event.data || {};
      if (data.type === 'started') {
        clearTimeout(timer);
        timer = setTimeout(stop, job.timeoutMs || DEFAULT_RUN_TIMEOUT_MS, 'O código demorou demais e foi interrompido. Confira se há um laço que nunca termina.');
        return;
      }
      if (data.type === 'result') {
        clearTimeout(timer);
        reply(id, data.result);
      }
    };
    worker.onerror = function (event) {
      clearTimeout(timer);
      event.preventDefault();
      stop('O ambiente parou com um erro: ' + (event.message || 'desconhecido') + '.');
    };
    worker.postMessage({ type: 'run', job: job });
  }

  window.addEventListener('message', function (event) {
    if (event.source !== window.parent) return;
    var data = event.data || {};
    if (data.type === 'runner-run' && data.job && Object.prototype.hasOwnProperty.call({ python: 1, javascript: 1, sql: 1 }, data.job.language)) {
      run(data.id, data.job);
    }
  });

  window.parent.postMessage({ type: 'runner-ready' }, '*');
})();
