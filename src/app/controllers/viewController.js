const ViewsController = (() => {
  const home = (_req, res) => {
    res.locals.pageTitle = 'Home';
    return res.status(200).render('new-checkin', {layout: 'checkin'});
  };

  const scores = (req, res) => {
    res.locals.pageTitle = 'Scores';
    res.locals.userId = req.params.userId || null;
    return res.status(200).render('user-scores');
  };

  const notFound = (_req, res) => {
    res.locals.pageTitle = 'Not Found';
    return res.status(404).render('404');
  };

  const error = (_req, res) => {
    res.locals.pageTitle = 'Error';
    return res.status(500).render('500');
  };

  return { home, scores, notFound, error };
})();
