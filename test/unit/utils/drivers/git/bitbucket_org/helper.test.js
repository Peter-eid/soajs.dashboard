"use strict";
var assert = require("assert");
var helper = require("../../../../../helper.js");
var driverHelper = helper.requireModule('./utils/drivers/git/bitbucket/helper.js');

describe("testing git/bitbucket helper.js", function () {
	var soajs = {};
	var model = {};
	var options = {
		provider: 'bitbucket'
	};
	
	before(function(done){
		// TODO - under construction
		var nock = require("nock");
		nock('https://api.bitbucket.org')
			.get('/1.0/users/')
			.query(true)
			.reply(200, {"result": true, "data": {}});
		
		nock('https://bitbucket.org')
			.post('/site/oauth2/access_token',"*")
			.query(true)
			.reply(200, {"result": true, "data": {"basePrice": 333, "discountedPrice": 333}});
		done();
	});
	
	describe("testing checkUserRecord", function () {
		it("Success", function (done) {
			options.token = '123';
			
			driverHelper.checkUserRecord(options, function (error, body) {
				// assert.ok(body);
				delete options.token;
				done();
			});
		});
	});
	
	describe("testing getRepoBranches", function () {
		
		it("Success without name", function (done) {
			driverHelper.getRepoBranches(options, function (error, body) {
				// assert.ok(body);
				done();
			});
		});
		
		it("Success with name", function (done) {
			options.token = '123';
			options.name = 'test';
			driverHelper.getRepoBranches(options, function (error, body) {
				// assert.ok(body);
				delete options.token;
				delete options.name;
				done();
			});
		});
	});
	
	describe("testing getAllRepos", function () {
		it("Success", function (done) {
			driverHelper.getAllRepos(options, function (error, body) {
				// assert.ok(body);
				done();
			});
		});
		
		it("Success wth token", function (done) {
			options.token = '123';
			
			driverHelper.getAllRepos(options, function (error, body) {
				// assert.ok(body);
				delete options.token;
				done();
			});
		});
	});
	
	describe("testing createAuthToken", function () {
		it("Success generate", function (done) {
			var data = {
				tokenInfo: {
					oauthKey: 'oauthKey',
					oauthSecret: 'oauthSecret'
				},
				action: 'generate',
				owner: 'owner',
				password: 'password'
			};
			driverHelper.createAuthToken(data, function (error, body) {
				// assert.ok(body);
				done();
			});
		});
	});
	
	describe("testing checkAuthToken", function () {
		var accountRecord = {};
		// it.skip("Success generate", function (done) {
		// 	options.action = 'generate';
		// 	options.tokenInfo = {};
		// 	driverHelper.checkAuthToken(soajs, options, model, accountRecord, function (error, body) {
		// 		done();
		// 	});
		// });
		
		it("Success refresh", function (done) {
			options.action = 'refresh';
			options.tokenInfo = {
				refresh_token : '1234',
				created: 700000,
				expires_in: 1234522
			};
			
			driverHelper.checkAuthToken(soajs, options, model, accountRecord, function (error, body) {
				// assert.ok(body);
				done();
			});
		});
	});
	
	describe("testing getRepoContent", function () {
		it("Success", function (done) {
			options.path = '';
			options.token = '123';
			driverHelper.getRepoContent(options, function (error, body) {
				// assert.ok(body);
				delete options.token;
				done();
			});
		});
	});

	describe("testing buildBranchesArray", function () {
		it("Success", function (done) {
			var allBranches = {
				develop: {
					raw_node: {}
				}
			};
			driverHelper.buildBranchesArray(allBranches);
			done();
		});
	});

	describe("testing addReposStatus", function () {
		it("Success", function (done) {
			var allRepos = [
				{
					full_name: 'abccccc'
				},
				{
					full_name: 'nameeeeee'
				},
				{
					full_name: 'abc/123'
				}
			];
			var activeRepos = [
				{
					type: 'multi',
					status: 'active',
					name: 'abc/123',
					configSHA: [
						{
							contentType: 'service',
							contentName: 'name'
						}
					]
				},
				{
					type: 'multi',
					status: 'active',
					name: 'nulti/repo',
					configSHA: [
						{
							contentType: 'service',
							contentName: 'name'
						}
					]
				},
				{
					name: 'abccccc',
					status: 'active',
					type: 'service',
					configSHA: '123456'
				},
				{
					name: 'nameeeeee',
					type: 'service',
					configSHA: '123456'
				}
			];
			driverHelper.addReposStatus(allRepos, activeRepos, function (error, body) {
				// assert.ok(body);
				done();
			});
		});
	});

	// describe("testing writeFile", function () {
	// 	it("Success writeFile", function (done) {
	// 		var options = {
	// 			configDirPath: './test/uploads/name1.js',
	// 			configFile: ""
	// 		};
	// 		driverHelper.writeFile(options, function (error, body) {
	// 			done();
	// 		});
	// 	});
	// });
});