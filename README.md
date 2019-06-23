# Clock Request Build Order

[![Greenkeeper badge](https://badges.greenkeeper.io/clocklimited/navy-clock-request-build.svg)](https://greenkeeper.io/)

This is an Order which is used by [Captains](http://github.com/microadam/navy-captain) as part of the Navy deployment suite.

It does the following actions:

* request the specified source decrypt it using the specified passphrase and untar it to the specified destination. This is not run when executed on the 'master' Captain
