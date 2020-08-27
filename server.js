const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const startProcess = require('./index');

const app = express();
app.use(express.static('build'));

// view engine setup
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());

app.use('/views', express.static(`${process.cwd()}/views`));
app.use(express.static('public'));

app.post('/start', (req, res) => startProcess(req, res));
app.get('/test-connection', (req, res) => res.status(200).send('CONNECTION STABLE'));

const port = process.env.PORT || 12500;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Node.js listening on port ${port}...`);
});
