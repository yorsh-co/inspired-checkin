const ViewRoutes = (() => {
  const register = (router) => {
    router.get('/', ViewsController.home);

    router.group('/users', (users) => {
      users.get('/scores', ViewsController.scores);
    });
  };

  return { register };
})();
