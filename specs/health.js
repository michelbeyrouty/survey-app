const chai = require('chai');
const chaiHttp = require('chai-http');
const createApp = require('../main');

chai.use(chaiHttp);

const { request, expect } = chai;

describe('GET /', () => {

  beforeEach(() => {
    app = createApp();
  });

  it('responds with hello world', async () => {
    const response = await request(app).get('/');

    expect(response.status).to.equal(200);
    expect(response.text).to.equal('Hello World!');
  });

});
