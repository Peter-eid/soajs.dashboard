'use strict';
const fs = require("fs");
const SHA256 = require("sha256");
const coreDrivers = require("soajs").drivers;
const utils = require("../../utils/utils.js");
const analytics = require('soajs.analytics');
const cloud = require("../cloud/deploy/index");
const colls = {
	analytics: 'analytics',
	environment: 'environment'
};

const modelName = "mongo";
const BL = {
	model: null,
	
	"activateAnalytics": function (config, req, res, cbMain) {
		cloud.init(modelName, function (err, catalogDeployment) {
			if (err) {
				return cbMain(err);
			}
			const combo = {};
			combo.collection = colls.analytics;
			combo.conditions = {
				"_type": "settings"
			};
			/**
			 * get analytics settings
			 * get current environment record where analytics should be deployed and dashboard environment record
			 * get elasticsearch cluster and create an elasticsearch connection
			 * forward the call to soajs.analytics repository
			 */
			BL.model.findEntry(req.soajs, combo, function (error, settings) {
				utils.checkErrorReturn(req.soajs, cbMain, {config: config, error: error, code: 600}, function () {
					const env = req.soajs.inputmaskData.env.toLowerCase();
					const credentials = req.soajs.inputmaskData.credentials;
					const opts = {
						envCode: env,
						analyticsSettings: settings,
						soajs: req.soajs,
						config: config,
						model: BL.model,
						catalogDeployment: catalogDeployment,
						es_dbName: req.soajs.inputmaskData.es_dbName ? req.soajs.inputmaskData.es_dbName : null,
						mode: "dashboard"
					};
					if (credentials) {
						opts.credentials = credentials;
					}
					// tracker.myAnalytics = new analytics(opts);
					// tracker.myAnalytics.run();
					analytics.activateAnalytics(opts, function (err, data) {
						return cbMain(null, data);
					});
				});
			});
		});
	},
	
	"getSettings": function (config, req, res, cbMain) {
		
		const combo = {};
		combo.collection = colls.analytics;
		combo.conditions = {
			"_type": "settings"
		};
		//get analytics settings object
		BL.model.findEntry(req.soajs, combo, function (error, response) {
			utils.checkErrorReturn(req.soajs, cbMain, {config: config, error: error, code: 600}, function () {
				//formulate object
				const opts = {
					settings: response,
					env: req.soajs.inputmaskData.env.toLowerCase()
				};
				//forward call to soajs.analytics repository
				analytics.checkAnalytics(opts, cbMain);
			});
		});
	},
	
	/**
	 * Update ElasticSearch Security Settings.
	 * @param {Object} config: soajs config object
	 * @param {Object} req: soajs req object
	 * @param {Object} res: soajs res object
	 * @param {Object} cbMain: callback function
	 */
	"updateSecuritySettings": function (config, req, res, cbMain) {
		let users = [];
		let es_security = {};
		if (req.soajs.inputmaskData.es_security) {
			users = Object.keys(req.soajs.inputmaskData.es_security);
		}
		checkForDuplicate(function (error) {
			utils.checkErrorReturn(req.soajs, cbMain, {config: config, error: error, code: 961}, function () {
				users.forEach(function (oneUser) {
					if (req.soajs.inputmaskData.es_security[oneUser].username && req.soajs.inputmaskData.es_security[oneUser].password) {
						es_security[oneUser] = SHA256(req.soajs.inputmaskData.es_security[oneUser].username + ":" + req.soajs.inputmaskData.es_security[oneUser].password)
					}
				});
				const opts = {};
				opts.collection = colls.analytics;
				opts.conditions = {
					"_type": "settings"
				};
				opts.options = {"upsert": false, "safe": true, "multi": false};
				opts.fields = {
					"$set": {
						"elasticsearch.security": es_security
					}
				};
				//update analytics security settings object
				BL.model.updateEntry(req.soajs, opts, function (error) {
					utils.checkErrorReturn(req.soajs, cbMain, {config: config, error: error, code: 600}, function () {
						return cbMain(null, true);
					});
				});
			});
		});
		
		function checkForDuplicate(cb) {
			for (let i = 0; i < users.length - 1; i++) {
				for (let j = i + 1; j < users.length; j++) {
					if (req.soajs.inputmaskData.es_security[users[i]].username === req.soajs.inputmaskData.es_security[users[j]].username) {
						return cb(true)
					}
				}
			}
			cb()
		}
	},
	
	/**
	 * Delete analytics components and deactivate analytics in service
	 * @param {Object} config: soajs config object
	 * @param {Object} req: soajs req object
	 * @param {Object} res: soajs res object
	 * @param {Object} cbMain: callback function
	 */
	"deactivateAnalytics": function (config, req, res, cbMain) {
		const opts = {
			soajs: req.soajs,
			model: BL.model
		};
		analytics.deactivateAnalytics(opts, function (err) {
			utils.checkErrorReturn(req.soajs, cbMain, {
				config: config,
				error: err,
				code: 600
			}, function () {
				return cbMain(null, true);
			});
		});
	}
};

module.exports = {
	"init": (modelName, cb) => {
		let modelPath;
		
		if (!modelName) {
			return cb(new Error("No Model Requested!"));
		}
		
		modelPath = __dirname + "/../../models/" + modelName + ".js";
		return requireModel(modelPath, cb);
		
		/**
		 * checks if model file exists, requires it and returns it.
		 * @param filePath
		 * @param cb
		 */
		function requireModel(filePath, cb) {
			//check if file exist. if not return error
			fs.exists(filePath, (exists) => {
				if (!exists) {
					return cb(new Error("Requested Model Not Found!"));
				}
				
				BL.model = require(filePath);
				return cb(null, BL);
			});
		}
	}
};