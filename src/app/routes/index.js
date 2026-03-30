const Routes = (() => {
  const registerAll = (router) => {
    ApiRoutes.register(router);
    ViewRoutes.register(router);
  };

  return { registerAll };
})();