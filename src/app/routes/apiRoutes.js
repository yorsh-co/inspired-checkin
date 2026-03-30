const ApiRoutes = (() => {
  const register = (router) => {
    router.group('/api', /*AuthMiddleware.requireAuth,*/ (api) => {
      api.group('/users', (users) => {
        users.get('/:userId/scores', ApiController.getUserScores);
      });
    });
  };

  return { register };
})();
