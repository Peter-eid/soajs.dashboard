'use strict';
const fs = require("fs");
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