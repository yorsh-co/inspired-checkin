const doGet = (e) => {
  return getApp().handle(e, 'GET');
};

const doPost = (e) => {
  return getApp().handle(e, 'POST');
};
