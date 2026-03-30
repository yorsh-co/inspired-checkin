const ApiController = (() => {
  /**
   * @param {Req} req
   * @param {Res} res
   */
  const getUserScores = (req, res) => {
    const userId = req.params.userId;

    if (!userId) throw HttpError.badRequest('ID do usuário vazio');

    const scores = ScoresService.getByUser(userId);

    if (!scores) {
      throw HttpError.badRequest('Usuário não encontrado');
    }

    return res.json(scores);
  };

  return { getUserScores };
})();
