module.exorts = {
  webpackDevMiddleware: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
};
