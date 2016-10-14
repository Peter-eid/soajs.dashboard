"use strict";
var productizationService = soajsApp.components;
productizationService.service('aclHelpers', ['aclDrawHelpers', function (aclDrawHelpers) {
	
	function groupApisForDisplay(apisArray, apiGroupName) {
		return aclDrawHelpers.groupApisForDisplay(apisArray, apiGroupName);
	}
	
	function fillAcl(currentScope) {
		var count = 0;
		var myAcl = {};
		var envCodes = currentScope.environments_codes;
		var aclFill = currentScope.aclFill;
		envCodes.forEach(function (oneEnv) {
			if (aclFill[oneEnv.code.toLowerCase()] && (!aclFill[oneEnv.code.toLowerCase()].access && !aclFill[oneEnv.code.toLowerCase()].apis && !aclFill[oneEnv.code.toLowerCase()].apisRegExp && !aclFill[oneEnv.code.toLowerCase()].apisPermission)) {
				count++;
				myAcl[oneEnv.code.toUpperCase()] = aclFill[oneEnv.code.toLowerCase()];
				propagateAcl(currentScope, myAcl[oneEnv.code.toUpperCase()]);
			}
		});
		
		if (count === 0) {
			//old schema
			myAcl[envCodes[0].code.toUpperCase()] = aclFill;
			propagateAcl(currentScope, myAcl[envCodes[0].code.toUpperCase()]);
			envCodes.forEach(function (oneEnv) {
				if (oneEnv.code !== envCodes[0].code) {
					myAcl[oneEnv.code.toUpperCase()] = angular.copy(myAcl[envCodes[0].code]);
				}
			});
			currentScope.msg.type = 'warning';
			currentScope.msg.msg = translation.warningMsgAcl[LANG];
		}
		currentScope.aclFill = myAcl;
		
		overlayLoading.hide();
	}
	
	function propagateAcl(currentScope, aclFill) {
		function grpByMethod(service, fixList) {
			var byMethod = false;
			for (var grp in fixList) {
				if (fixList[grp].apisRest) {
					byMethod = true;
					for (var method in fixList[grp].apisRest) {
						if (!service[method]) {
							service[method] = {
								apis: {}
							};
						}
						fixList[grp].apisRest[method].forEach(function (api) {
							if (service.apis) {
								if (service.apis[api.v]) {
									service[method].apis[api.v] = service.apis[api.v];
								}
							}
						});
					}
				}
			}
			if (byMethod) {
				delete service.apis;
			}
		}
		
		for (var propt in aclFill) {
			if (aclFill.hasOwnProperty(propt)) {
				var service = aclFill[propt];
				service.name = propt;
				service.include = true;
				service.collapse = false;
				
				var currentService;
				for (var x = 0; x < currentScope.allServiceApis.length; x++) {
					if (currentScope.allServiceApis[x].name === propt) {
						currentService = currentScope.allServiceApis[x];
						break;
					}
				}
				if (service.access) {
					if (service.access === true) {
						service.accessType = 'private';
					}
					else if (service.access === false) {
						service.accessType = 'public';
					}
					else if (Array.isArray(service.access)) {
						service.accessType = 'groups';
						service.grpCodes = {};
						if (service.access.indexOf('owner') > -1) {
							service.grpCodes['owner'] = true;
						}
						if (service.access.indexOf('administrator') > -1) {
							service.grpCodes['admin'] = true;
						}
					}
				}
				else {
					service.accessType = 'public';
				}
				
				if (service.apisPermission === 'restricted') {
					service.apisRestrictPermission = true;
				}
				// backward compatible. grp by method
				if (!service.get && !service.post && !service.put && !service.delete) {
					if (currentService) {
						grpByMethod(service, currentService.fixList);
					}
				}
				
				if (service.get || service.post || service.put || service.delete) {
					for (var method in service) {
						if (service[method]) {
							if (service[method].apis) {
								for (var ap in service[method].apis) {
									if (service[method].apis.hasOwnProperty(ap)) {
										service[method].apis[ap].include = true;
										service[method].apis[ap].accessType = 'clear';
										
										if (service[method].apis[ap].access == true) {
											service[method].apis[ap].accessType = 'private';
										}
										else if (service[method].apis[ap].access === false) {
											service[method].apis[ap].accessType = 'public';
										}
										else {
											if (Array.isArray(service[method].apis[ap].access)) {
												service[method].apis[ap].accessType = 'groups';
												service[method].apis[ap].grpCodes = {};
												if ((service[method].apis[ap].access.indexOf('administrator') > -1)) {
													service[method].apis[ap].grpCodes['admin'] = true;
												}
												if ((service[method].apis[ap].access.indexOf('owner') > -1)) {
													service[method].apis[ap].grpCodes['owner'] = true;
												}
											}
										}
									}
								}
							}
						}
					}
				}
				
				if (service.apis) {
					for (var ap in service.apis) {
						if (service.apis.hasOwnProperty(ap)) {
							service.apis[ap].include = true;
							service.apis[ap].accessType = 'clear';
							
							if (service.apis[ap].access == true) {
								service.apis[ap].accessType = 'private';
							}
							else if (service.apis[ap].access === false) {
								service.apis[ap].accessType = 'public';
							}
							else {
								if (Array.isArray(service.apis[ap].access)) {
									service.apis[ap].accessType = 'groups';
									service.apis[ap].grpCodes = {};
									if ((service.apis[ap].access.indexOf('administrator') > -1)) {
										service.apis[ap].grpCodes['admin'] = true;
									}
									if ((service.apis[ap].access.indexOf('owner') > -1)) {
										service.apis[ap].grpCodes['owner'] = true;
									}
								}
							}
						}
					}
				}
				aclDrawHelpers.applyApiRestriction(aclFill, currentService);
			}
		}
	}
	
	function applyPermissionRestriction(scope, envCode, service) {
		var aclFill = scope.aclFill[envCode];
		aclDrawHelpers.applyApiRestriction(aclFill, service);
	}
	
	function checkForGroupDefault(scope, envCode, service, grp, val, myApi) {
		var aclFill = scope.aclFill[envCode];
		aclDrawHelpers.checkForGroupDefault(aclFill, service, grp, val, myApi);
	}
	
	function constructAclFromPost(aclFill) {
		var aclObj = {};
		for (var envCode in aclFill) {
			aclObj[envCode.toLowerCase()] = {};
			aclFromPostPerEnv(aclFill[envCode.toUpperCase()], aclObj[envCode.toLowerCase()]);
			if (Object.keys(aclObj[envCode.toLowerCase()]).length === 0) {
				delete aclObj[envCode.toLowerCase()];
			}
		}
		return aclObj;
	}
	
	function aclFromPostPerEnv(aclFill, aclObj) {
		for (var propt in aclFill) {
			if (aclFill.hasOwnProperty(propt)) {
				var s = angular.copy(aclFill[propt]);
				
				if (s.include === true) {
					aclObj[propt] = {};
					aclObj[propt].apis = {};
					
					if (s.accessType === 'private') {
						aclObj[propt].access = true;
					}
					else if (s.accessType === 'groups') {
						aclObj[propt].access = [];
						var grpCodes = s.grpCodes;
						if (grpCodes.owner) {
							aclObj[propt].access.push('owner');
						}
						if (grpCodes.admin) {
							aclObj[propt].access.push('administrator');
						}
					}
					else {
						aclObj[propt].access = false;
					}
					
					if (s.apisRestrictPermission === true) {
						aclObj[propt].apisPermission = 'restricted';
					}
					if (s.get || s.post || s.put || s.delete) {
						for (var method in s) {
							if (s[method].apis) {
								aclObj[propt][method] = {
									apis: {}
								};
								for (var ap in s[method].apis) {
									if (s[method].apis.hasOwnProperty(ap)) {
										var api = s[method].apis[ap];
										if (( s.apisRestrictPermission === true && api.include === true) || (!s.apisRestrictPermission )) {
											/// need to also check for the default api if restricted
											aclObj[propt][method].apis[ap] = {};
											if (api.accessType === 'private') {
												aclObj[propt][method].apis[ap].access = true;
											}
											else if (api.accessType === 'public') {
												aclObj[propt][method].apis[ap].access = false;
											}
											else if (api.accessType === 'groups') {
												aclObj[propt][method].apis[ap].access = [];
												var grpCodes = api.grpCodes;
												if (grpCodes) {
													if (grpCodes.admin) {
														aclObj[propt][method].apis[ap].access.push('administrator');
													}
													if (grpCodes.owner) {
														aclObj[propt][method].apis[ap].access.push('owner');
													}
												}
											}
										}
									}
								}
							}
						}
					}
					else {
						if (s.apis) {
							for (var ap in s.apis) {
								if (s.apis.hasOwnProperty(ap)) {
									var api = s.apis[ap];
									
									if (( s.apisRestrictPermission === true && api.include === true) || (!s.apisRestrictPermission )) {
										/// need to also check for the default api if restricted
										aclObj[propt].apis[ap] = {};
										if (api.accessType === 'private') {
											aclObj[propt].apis[ap].access = true;
										}
										else if (api.accessType === 'public') {
											aclObj[propt].apis[ap].access = false;
										}
										else if (api.accessType === 'groups') {
											aclObj[propt].apis[ap].access = [];
											var grpCodes = api.grpCodes;
											if (grpCodes) {
												if (grpCodes.admin) {
													aclObj[propt].apis[ap].access.push('administrator');
												}
												if (grpCodes.owner) {
													aclObj[propt].apis[ap].access.push('owner');
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
	
	return {
		'groupApisForDisplay': groupApisForDisplay,
		'fillAcl': fillAcl,
		'applyPermissionRestriction': applyPermissionRestriction,
		'checkForGroupDefault': checkForGroupDefault,
		'constructAclFromPost': constructAclFromPost
	}
}]);