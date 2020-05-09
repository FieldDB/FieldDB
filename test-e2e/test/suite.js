const {
  expect,
} = require('chai');
const supertest = require('supertest');

const service = require('../../backbone_client/bin/https-server');

const {
  URL,
} = process.env;

before((done) => {
  if (URL) {
    done();
    return;
  }

  service.listen(0, () => {
    process.env.URL = `https://localhost:${service.address().port}`;
    supertest(process.env.URL)
      .get('/user.html')
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        // eslint-disable-next-line
        console.log('Server started', process.env.URL);
        expect(res.text).to.contain('user_online_dashboard');
        done();
      });
  });
});

after(() => {
  service.close();
  // eslint-disable-next-line
  console.log('Done');
});
