const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const startProcess = require('./index');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());

app.use('/views', express.static(`${process.cwd()}/views`));
app.use(express.static('public'));


app.get('/', (req, res) => res.render('index.ejs'));
app.post('/start', (req, res) => startProcess(req, res));


const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Node.js listening on port ${port}...`);
});
