var assert = require('assert');

// Run this way: ./node_modules/mocha/bin/mocha 
describe('blob', function() {
  describe('parse date ', function() {
    it('should return epock when the ts is a string', function() {
      let d = {"ts":"2021-09-17T23:54:03.760122","t1":12.87,"p":969.79,"h":82.7,"bat":3.92,"offset":0,"t2":13.3,"id":"10035"};
      console.log("debug: "); 
      console.log(d.ts);
      console.log(typeof d.ts);
      console.log(isNaN(d.ts));
      console.log(Date.parse(d.ts));
      if((typeof d.ts === 'string')&&isNaN(d.ts) ) 
      {
        console.log("parsing: d.ts", d.ts);
        d.ts = Date.parse(d.ts)/1000;
        
      }
      let dt = new Date(0); // The 0 there is the key, which sets the date to the epoch
      console.log(dt);
      dt.setUTCSeconds(d.ts);
      console.log(dt);
      d.ts = dt;
      console.log(d);
    });
  });
});
