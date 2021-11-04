import App from './app';

const app = new App().application;

app.listen(8080, () => {
  console.log('Server Start');
});