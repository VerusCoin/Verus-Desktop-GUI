const fs = require('fs');
const path = require('path');

const reactRoot = path.resolve(__dirname, '..');

const read = (...parts) => fs.readFileSync(path.join(reactRoot, ...parts), 'utf8');

const findExpressionStrings = (value, location = '$', expressions = []) => {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      findExpressionStrings(entry, `${location}[${index}]`, expressions);
    });
  } else if (value != null && typeof value === 'object') {
    Object.entries(value).forEach(([key, entry]) => {
      const nextLocation = `${location}.${key}`;

      if (key === 'x' && typeof entry === 'string') {
        expressions.push(nextLocation);
      }

      findExpressionStrings(entry, nextLocation, expressions);
    });
  }

  return expressions;
};

describe('renderer security build configuration', () => {
  test('production disables eval source generation and uses expression-free Lottie', () => {
    const webpackConfig = read('webpack.config.js');

    expect(webpackConfig).toContain("devtool: isProduction ? false : 'source-map'");
    expect(webpackConfig).toContain("'lottie-web$': path.resolve(");
    expect(webpackConfig).toContain("'node_modules/lottie-web/build/player/lottie_light.js'");
    expect(webpackConfig).toContain("'vm$': path.resolve(jsSourcePath, 'util/security/noVm.js')");
    expect(webpackConfig).toContain('new TerserPlugin({');
  });

  test('development CSS loaders process self-hosted font stylesheets', () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    jest.resetModules();
    jest.doMock('webpack-dashboard/plugin', () => function DashboardPlugin() {});
    jest.doMock('terser-webpack-plugin', () => function TerserPlugin() {});

    const developmentConfig = require(path.join(reactRoot, 'webpack.config.js'));
    const fontStylesheet = path.join(
      reactRoot,
      'node_modules',
      '@fontsource',
      'source-code-pro',
      'latin.css',
    );

    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;

    const matchingRule = developmentConfig.module.rules.find((rule) => (
      rule.test instanceof RegExp
      && rule.test.test(fontStylesheet)
      && !(rule.exclude instanceof RegExp && rule.exclude.test(fontStylesheet))
    ));

    expect(fs.existsSync(fontStylesheet)).toBe(true);
    expect(matchingRule).toBeDefined();
    expect(matchingRule.use).toContain('css-loader');
  });

  test('production template has a script policy without eval', () => {
    const template = read('www', 'index.html');
    const scriptPolicy = template.match(/script-src ([^;]+);/);

    expect(template).toContain('http-equiv="Content-Security-Policy"');
    expect(scriptPolicy).not.toBeNull();
    expect(scriptPolicy[1]).toBe("'self'");
    expect(template).toContain("connect-src 'self' http://127.0.0.1:* ws://127.0.0.1:*");
    expect(template).not.toContain("'unsafe-eval'");
  });

  test('fonts are bundled and no Google Fonts stylesheet is requested', () => {
    const entry = read('src', 'index.js');
    const bootstrap = read('src', 'assets', 'global', 'css', 'bootstrap.min.css');
    const terminalPatch = read('patches', 'react-terminal+1.4.4.patch');

    expect(entry).toContain("@fontsource/source-code-pro/latin.css");
    expect(entry).toContain("@fontsource/source-sans-pro/latin.css");
    expect(entry).toContain("@fontsource/source-sans-pro/latin-italic.css");
    expect(bootstrap).not.toContain('fonts.googleapis.com');
    expect(terminalPatch).toContain('-@import url("https://fonts.googleapis.com/');
  });

  test('renderer logging does not trust process arguments', () => {
    const devlog = read('src', 'util', 'devlog.js');
    const testConfig = read('src', 'util', 'testutil', 'testConfig.js');

    expect(devlog).not.toContain('.argv');
    expect(devlog).not.toContain("'devmode'");
    expect(devlog).toContain('appConfig.general.main.dev === true');
    expect(testConfig).toContain('requireNativeAuthForIrreversibleActions: true');
  });

  test('shipped Lottie data contains no executable expressions', () => {
    const animationsDir = path.join(reactRoot, 'src', 'assets', 'animations');
    const expressionLocations = fs.readdirSync(animationsDir)
      .filter((filename) => filename.endsWith('.json'))
      .flatMap((filename) => {
        const animation = JSON.parse(fs.readFileSync(path.join(animationsDir, filename)));
        return findExpressionStrings(animation).map((location) => `${filename}:${location}`);
      });

    expect(expressionLocations).toEqual([]);
    expect(fs.existsSync(path.join(animationsDir, 'radar.json'))).toBe(false);
  });
});
