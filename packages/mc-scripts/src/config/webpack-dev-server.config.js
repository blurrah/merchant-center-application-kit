const path = require('path');
const { processConfig } = require('@commercetools-frontend/application-config');
const { processHeaders } = require('@commercetools-frontend/mc-html-template');
const devAuthentication = require('@commercetools-frontend/mc-dev-authentication');
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');

const sourcePath = process.cwd();
const applicationConfig = processConfig({
  // TODO: Remove in `v17`
  deprecatedOptions: {
    envPath: path.join(sourcePath, 'env.json'),
    headersPath: path.join(sourcePath, 'headers.json'),
    cspPath: path.join(sourcePath, 'csp.json'),
  },
});
const compiledHeaders = processHeaders(applicationConfig);

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const host = process.env.HOST || '0.0.0.0';

module.exports = ({ proxy, allowedHost, contentBase, publicPath }) => ({
  // WebpackDevServer 2.4.3 introduced a security fix that prevents remote
  // websites from potentially accessing local content through DNS rebinding:
  // https://github.com/webpack/webpack-dev-server/issues/887
  // https://medium.com/webpack/webpack-dev-server-middleware-security-issues-1489d950874a
  // However, it made several existing use cases such as development in cloud
  // environment or subdomains in development significantly more complicated:
  // https://github.com/facebookincubator/create-react-app/issues/2271
  // https://github.com/facebookincubator/create-react-app/issues/2233
  // While we're investigating better solutions, for now we will take a
  // compromise. Since our WDS configuration only serves files in the `public`
  // folder we won't consider accessing them a vulnerability. However, if you
  // use the `proxy` feature, it gets more dangerous because it can expose
  // remote code execution vulnerabilities in backends like Django and Rails.
  // So we will disable the host check normally, but enable it if you have
  // specified the `proxy` setting. Finally, we let you override it if you
  // really know what you're doing with a special environment variable.
  disableHostCheck:
    !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true',
  // Enable gzip compression of generated files.
  compress: true,
  // Silence WebpackDevServer's own logs since they're generally not useful.
  // It will still show compile warnings and errors with this setting.
  clientLogLevel: 'none',
  // By default WebpackDevServer serves physical files from current directory
  // in addition to all the virtual build products that it serves from memory.
  // This is confusing because those files won’t automatically be available in
  // production build folder unless we copy them. However, copying the whole
  // project directory is dangerous because we may expose sensitive files.
  // Instead, we establish a convention that only files in `public` directory
  // get served. Our build script will copy `public` into the `build` folder.
  // In `index.html`, you can get URL of `public` folder with %PUBLIC_URL%:
  // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
  // In JavaScript code, you can access it with `process.env.PUBLIC_URL`.
  // Note that we only recommend to use `public` folder as an escape hatch
  // for files like `favicon.ico`, `manifest.json`, and libraries that are
  // for some reason broken when imported through Webpack. If you just want to
  // use an image, put it in `src` and `import` it from JavaScript instead.
  contentBase,
  // By default files from `contentBase` will not trigger a page reload.
  watchContentBase: false,
  // Enable hot reloading server. It will provide /sockjs-node/ endpoint
  // for the WebpackDevServer client so it can learn when the files were
  // updated. The WebpackDevServer client is included as an entry point
  // in the Webpack development configuration. Note that only changes
  // to CSS are currently hot reloaded. JS changes will refresh the browser.
  hot: true,
  // Use 'ws' instead of 'sockjs-node' on server since we're using native
  // websockets in `webpackHotDevClient`.
  transportMode: 'ws',
  // Prevent a WS client from getting injected as we're already including
  // `webpackHotDevClient`.
  injectClient: false,
  publicPath,
  // WebpackDevServer is noisy by default so we emit custom message instead
  // by listening to the compiler events with `compiler.hooks[...].tap` calls
  // above.
  quiet: true,
  // Reportedly, this avoids CPU overload on some systems.
  // https://github.com/facebookincubator/create-react-app/issues/293
  // src/node_modules is not ignored to support absolute imports
  // https://github.com/facebookincubator/create-react-app/issues/1065
  watchOptions: {
    // ignored: '',
  },
  // Enable HTTPS if the HTTPS environment variable is set to 'true'
  https: protocol === 'https',
  host,
  overlay: false,
  historyApiFallback: {
    // Paths with dots should still use the history fallback.
    // See https://github.com/facebookincubator/create-react-app/issues/387.
    disableDotRule: true,
  },
  headers: compiledHeaders,
  public: allowedHost,
  proxy,
  before(app) {
    app.set('views', devAuthentication.views);
    app.set('view engine', devAuthentication.config.viewEngine);
    // This lets us open files from the runtime error overlay.
    app.use(errorOverlayMiddleware());
    app.use('/api/graphql', (request, response) => {
      response.statusCode = 400;
      response.setHeader('Content-Type', 'application/json');
      const errorMessage = `This GraphQL endpoint is not available in ${process.env.NODE_ENV} mode, as it's not necessary. The menu configuration is loaded from the file "menu.json" (more info at https://www.npmjs.com/package/@commercetools-frontend/application-shell). In case you do need to test things out, you can pass a "mcProxyApiUrl" to your application config (in the "additionalEnv" properties) and point it to the production environment, for example for GCP-EU use "https://mc.europe-west1.gcp.commercetools.com/api/graphql".`;
      const fakeApolloError = new Error(errorMessage);
      response.end(
        JSON.stringify({
          data: null,
          error: fakeApolloError,
        })
      );
    });
    app.use(
      '/login',
      devAuthentication.middlewares.createLoginMiddleware(applicationConfig.env)
    );
    // Intercept the /logout page and "remove" the auth cookie value
    app.use(
      '/logout',
      devAuthentication.middlewares.createLogoutMiddleware(
        applicationConfig.env
      )
    );
  },
});
