let App;

const getApp = () => {
  if (!App)
    App = Framework.createApp({
      config: AppConfig,
      middleware: [LoggerMiddleware.logRequest],
      routes: (router) => Routes.registerAll(router),
    });

  return App;
};
