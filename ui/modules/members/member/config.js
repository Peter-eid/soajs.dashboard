"use strict";

var membersConfig = {
	grid: {
		recordsPerPageArray: [5, 10, 50, 100],
		'columns': [
			{'label': 'Username', 'field': 'username'},
			{'label': 'First Name', 'field': 'firstName'},
			{'label': 'Last Name', 'field': 'lastName'},
			{'label': 'Email', 'field': 'email'},
			{'label': 'Status', 'field': 'status'},
			{'label': 'Groups', 'field': 'grpsArr'}
		],
		'leftActions': [],
		'topActions': [],
		'defaultSortField': '',
		'defaultLimit': 10
	},

	form: {
		'name': '',
		'label': '',
		'actions': {},
		'entries': [
			{
				'name': 'username',
				'label': 'Username',
				'type': 'text',
				'placeholder': 'Enter Username...',
				'value': '',
				'tooltip': 'Usernames are alphanumeric and support _ & - characters only',
				'required': true
			},
			{
				'name': 'email',
				'label': 'Email',
				'type': 'email',
				'placeholder': 'Enter Email...',
				'value': '',
				'tooltip': 'myemail@example.domain',
				'required': true
			},
			{
				'name': 'firstName',
				'label': 'First Name',
				'type': 'text',
				'placeholder': 'Enter First Name...',
				'value': '',
				'tooltip': 'Enter the First Name of the User',
				'required': true
			},
			{
				'name': 'lastName',
				'label': 'Last Name',
				'type': 'text',
				'placeholder': 'Enter Last Name...',
				'value': '',
				'tooltip': 'Enter the Last Name of the User',
				'required': true
			}
		]
	},

	permissions:{
		'adminUser':{
			'list' : ['urac', '/admin/listUsers'],
			'changeStatusAccess' : ['urac', '/admin/changeStatusAccess'],
			'editUser' : ['urac', '/admin/editUser'],
			'addUser' : ['urac', '/admin/addUser']
		},
		'adminGroup':{
			'list' : ['urac', '/admin/group/list'],
			'add' : ['urac', '/admin/group/add'],
			'edit' : ['urac', '/admin/group/edit'],
			'delete' : ['urac', '/admin/group/delete'],
			'addUsers' : ['urac', '/admin/group/addUsers']
		}
	}
};