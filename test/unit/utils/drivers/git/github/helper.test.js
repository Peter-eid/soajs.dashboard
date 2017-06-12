"use strict";
var assert = require("assert");
var helper = require("../../../../../helper.js");
var driverHelper = helper.requireModule('./utils/drivers/git/github/helper.js');

describe("testing git/github helper.js", function () {
	var soajs = {};
	var options = {
		type: 'basic',
		username: "username",
		password: 'password',
		provider: 'github'
	};

	describe("testing authenticate", function () {
		it("Success", function (done) {
			driverHelper.authenticate(options, function (error, body) {
				// assert.ok(body);
				done();
			});
		});
	});

	describe("testing createAuthToken", function () {
		it("Success", function (done) {
			driverHelper.createAuthToken(options, function (error, body) {
				// assert.ok(body);
				done();
			});
		});
	});

	describe("testing checkUserRecord", function () {
		it("Success checkUserRecord", function (done) {
			options = {
				owner: '123456789'
			};
			driverHelper.checkUserRecord(options, function (error, body) {
				// assert.ok(body);
				done();
			});
		});
	});

	describe("testing checkOrgRecord", function () {
		it("Success checkOrgRecord", function (done) {
			options = {
				owner: '123456789'
			};
			driverHelper.checkOrgRecord(options, function (error, body) {
				// assert.ok(body);
				done();
			});
		});
	});

	describe("testing getRepoBranches", function () {
		it("Success", function (done) {
			driverHelper.getRepoBranches(options, function (error, body) {
				// assert.ok(body);
				done();
			});
		});
	});

	describe("testing getRepoContent", function () {
		it("Success", function (done) {
			options.path = '';
			driverHelper.getRepoContent(options, function (error, body) {
				// assert.ok(body);
				done();
			});
		});
	});

	describe("testing getAllRepos", function () {
		it("Success getAllRepos token", function (done) {
			options = {
				token: '123456789'
			};
			driverHelper.getAllRepos(options, function (error, body) {
				// assert.ok(body);
				done();
			});
		});

		it("Success getAllRepos personal", function (done) {
			options = {
				type: 'personal',
				owner: '123456789'
			};
			driverHelper.getAllRepos(options, function (error, body) {
				// assert.ok(body);
				done();
			});
		});

		it("Success getAllRepos organization", function (done) {
			options = {
				type: 'organization',
				owner: '123456789'
			};
			driverHelper.getAllRepos(options, function (error, body) {
				// assert.ok(body);
				done();
			});
		});
	});

	describe("testing addReposStatus", function () {
		it("Success", function (done) {
			var allRepos = [
				{
					full_name: 'abc'
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
					name: 'abc',
					status: 'active',
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

});