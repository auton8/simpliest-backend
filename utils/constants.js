const ERRORS = {
	INVALID_FILE_FORMAT: {
		status: false,
		message: 'Invalid Import File Format',
	},

	FILE_NOT_FOUND: {
		status: false,
		message: 'File Not Found',
	},

	MISSING_PARAMS: {
		status: false,
		message: 'Missing Params',
	},

	RULE_NOT_FOUND: {
		status: false,
		message: 'Data Not Found',
	},

	RECORD_EXISTS: {
		status: false,
		message: 'Note Already Exist',
	},

	INVALID_PARAMS: {
		status: false,
		message: 'Invalid Params Value',
	},

	INVALID_INVITE: {
		status: false,
		message: 'Can\'t Send invite to your own email',
	},

	UNAUTHORIZE: {
		status: false,
		message: 'Unauthorize',
		code: 1001
	},

	SOMETHING_WRONG: {
		status: false,
		message: 'Something Went Wrong Please Try Again Later !'
	},

	INVALID_EMAIL_PASSWORD: {
		status: false,
		message: 'Invalid email or wrong password. Try again or click ‘Forgot password’ to reset it',
	},

	DUPLICATE_EMAIL: {
		status: false,
		message: 'Email address already exists',
	},

	DUPLICATE_USER: {
		status: false,
		message: 'User account already exists',
	},

	DUPLICATE_ROLE: {
		status: false,
		message: 'Role already exists',
	},

	DUPLICATE_RULE: {
		status: false,
		message: 'Rule already exists',
	},

	DUPLICATE_RECORD: {
		status: false,
		message: 'Test already added in the group',
	},

	DUPLICATE_INVITE: {
		status: false,
		message: 'Invite already exists',
	},

	ASSIGN_ORGANIZATION: {
		status: false,
		message: 'Assign Organization to User',
	},

	DB_ERROR: {
		status: false,
		message: 'DATABASE ERROR',
	},

	PLAN_LIMIT_EXCEEDED: {
		status: false,
		message: 'You Have Used Your Available Limit In Your Subscription Plan, Please Upgrade Your Plan To Continue',
	},

	PLAN_EXPIRED: {
		status: false,
		message: 'Your Subscription Plan Is Expired, Please Renew Your Plan To Continue',
	},

	NOT_FREE: {
		status: false, message: 'This Service Is Not Available In Free Bundle'
	},

	NO_RECORD: {
		status: false,
		message: "No Record Found"
	},
	INVALID_PERM: {
		status: false,
		message: "Invalid Permission, Please Try Again !"
	},
	NO_PERM: {
		status: false,
		message: "You Do Not Have Permission, Please Re-Login To Continue Or Contact System Admin"
	},
	TEST_BLOCK: {
		status: false,
		message: 'Test Steps Are Blocked by other user',
	},

}

const HISTORY_DATES = {
	TODAY: 1,
	YESTERDAY: 2,
	SEVEN_DAYS: 3,
	THIRTY_DAYS: 4,
	CUSTOM: 5
}

const BROWSERS = {
	CHROME: 1,
	FIREFOX: 2,
	EDGE: 3
}

const DAYS = {
	MONDAY: 1,
	TUESDAY: 2,
	WEDNESDAY: 3,
	THURSDAY: 4,
	FRIDAY: 5,
	SATURDAY: 6,
	SUNDAY: 7
}

const PERMISSIONS = {
	list_group: 'list_group',
	create_group: 'create_group',
	edit_group: 'edit_group',
	delete_group: 'delete_group',
	list_schedule: 'list_schedule',
	create_schedule: 'create_schedule',
	edit_schedule: 'edit_schedule',
	delete_schedule: 'delete_schedule',
	list_test: 'list_test',
	create_test: 'create_test',
	edit_test: 'edit_test',
	delete_test: 'delete_test',
	run_test: 'run_test',
	list_test_history: 'list_test_history',
	add_test_group: 'add_test_group',
	change_test_group: 'change_test_group',
	test_run_detail: 'test_run_detail',
	list_rule: 'list_rule',
	create_rule: 'create_rule',
	edit_rule: 'edit_rule',
	delete_rule: 'delete_rule',
	list_migration: 'list_migration',
	create_migration: 'create_migration',
	edit_migration: 'edit_migration',
	delete_migration: 'delete_migration',
	execution_migration: 'execute_migration',
	parse_migration: 'parse_migration',
	switch_migration: 'switch_migration'
}

const INVITE_STATUS = {
	PENDING: 1,
	ACCEPT: 2,
	CANCEL: 3,
	REJECT: 4,
	LEAVE_ORG: 5,
	REMOVE_USER: 6
}

const PLAN_LIMITS = {
	test_cases_limit: 'test_cases_limit',
	scenarios_limit: 'scenarios_limit',
	scenarios_cases_limit: 'scenarios_cases_limit',
	concurrent_exec_limit: 'concurrent_exec_limit',
	number_of_exec_limit: 'number_of_exec_limit',
	exec_instances_limit: 'exec_instances_limit',
	organizations_limit: 'organizations_limit',
	members_limit: 'members_limit',
	report_members_limit: 'report_members_limit',
	expire_in_days: 'expire_in_days',
	api_suites_limit: 'api_suites_limit',
	api_suite_requests_limit: 'api_suite_requests_limit',
	schedules_limit: 'schedules_limit',
	schedules_test_cases_limit: 'schedules_test_cases_limit',
}

const SOMETHING_WENT_WRONG = (errorMessage) => ({
	status: false,
	message: 'Something Went Wrong Please Try Again Later !',
	error: errorMessage || 'Unknown error occurred',
});

const INVALID_PARAMS = (errors) => ({
	status: false,
	message: 'Missing or invalid params',
	errors: errors.array(),
});

const PERMISSIONS_NEW = {
	"list_api": "list_api",
	"create_api": "create_api",
	"edit_api": "edit_api",
	"delete_api": "delete_api",
	"execute_api": "execute_api",

	"list_policy": "list_policy",
	"create_policy": "create_policy",
	"edit_policy": "edit_policy",
	"delete_policy": "delete_policy",

	"list_member": "list_member",
	"create_member": "create_member",
	"edit_member": "edit_member",
	"delete_member": "delete_member",

	"list_performance": "list_performance",
	"create_performance": "create_performance",
	"edit_performance": "edit_performance",
	"delete_performance": "delete_performance",
	"execute_performance": "execute_performance",

	"list_group": "list_group",
	"create_group": "create_group",
	"edit_group": "edit_group",
	"delete_group": "delete_group",

	"list_schedule": "list_schedule",
	"create_schedule": "create_schedule",
	"edit_schedule": "edit_schedule",
	"delete_schedule": "delete_schedule",

	"list_test": "list_test",
	"create_test": "create_test",
	"edit_test": "edit_test",
	"delete_test": "delete_test",
	"execute_test": "execute_test",

	"list_training": "list_training",
	"create_training": "create_training",
	"edit_training": "edit_training",
	"delete_training": "delete_training",

	"run_test": "run_test",
	"list_test_history": "list_test_history",
	"add_test_group": "add_test_group",
	"change_test_group": "change_test_group",
	"test_run_detail": "test_run_detail"
}

const PERMISSION_NAMES = {
	list_performance: 'View Performance Tests List',
	create_performance: 'Create New Performance Test',
	edit_performance: 'Edit Performance Test',
	delete_performance: 'Delete Performance Test',
	list_member: 'View Members List',
	create_member: 'Add New Member',
	edit_member: 'Edit Member',
	delete_member: 'Delete Member',
	list_policy: 'View Policies List',
	create_policy: 'Create New Policy',
	edit_policy: 'Edit Policy',
	delete_policy: 'Delete Policy',
	list_api: 'View Api Suites List',
	create_api: 'Create New Api Suite',
	edit_api: 'Edit Api Suite',
	delete_api: 'Delete Api Suite',
	list_group: 'View Group List',
	create_group: 'Create New Group',
	edit_group: 'Edit Group',
	delete_group: 'Delete Group',
	list_schedule: 'View Schedules List',
	create_schedule: 'Create New Schedule',
	edit_schedule: 'Edit Schedule',
	delete_schedule: 'Delete Schedule',
	list_test: 'List Tests',
	create_test: 'Create New Test',
	edit_test: 'Edit Test',
	delete_test: 'Delete Test',
	run_test: 'Run Test',
	list_test_history: 'View Test History',
	add_test_group: 'Add Test To Group',
	change_test_group: 'Change Test Group',
	test_run_detail: 'View Test Runs',
}

const NODE_MAILER_CONFIG = {
	EMAIL_CONFIG: {
		host: "smtpout.secureserver.net",
		secure: true,
		secureConnection: false, // TLS requires secureConnection to be false
		tls: {
			ciphers: 'SSLv3'
		},
		requireTLS: true,
		port: 465,
		debug: true,

		// service: 'Godaddy',
		// host: "smtpout.secureserver.net",
		// secureConnection: true,
		// secure: true,
		// port: 465,
		auth: {
			user: "Info@auton8.io", // generated ethereal user
			pass: "Cheetah@14", // generated ethereal password
		},
	},
	EMAIL_FROM: '"Auton8" <Info@auton8.io>'
}

const SUITE = {
	WEB: 1,
	API: 2,
	SCENERIO: 3,
	MAPPING: 4,
	PERFORMANCE: 5
}

const EXECUTION = {
	PLAY: 1,
	PAUSE: 2,
	STOP: 3
}

const PROTOCOL = {
	FTP: 1,
	SFTP: 2
}

const CONDITIONS = {
	EQUALS: 1,
	DOES_NOT_EQUALS: 2,
	IS_EMPTY: 3,
	IS_NOT_EMPTY: 4,
	CONTAINS: 5,
	DOES_NOT_CONTAIN: 6,
	IS_A_NUMBER: 7,
	LESS_THAN: 8,
	LESS_THAN_OR_EQUAL: 9,
	GREATER_THAN: 10,
	GREATER_THAN_OR_EQUAL: 11,
	IS_NULL: 12
}

const API_CONDITIONS = {
	EQUALS: 1,
	DOES_NOT_EQUALS: 2,
	IS_EMPTY: 3,
	IS_NOT_EMPTY: 4,
	CONTAINS: 5,
	DOES_NOT_CONTAIN: 6,
	IS_A_NUMBER: 7,
	EQUALS_NUMBER: 8,
	LESS_THAN: 9,
	LESS_THAN_OR_EQUAL: 10,
	GREATER_THAN: 11,
	GREATER_THAN_OR_EQUAL: 12,
	HAS_KEY: 13,
	HAS_VALUE: 14,
	IS_NULL: 15
}

const API_TYPE = {
	REQUEST: 1,
	PAUSE: 2,
	RESPONSE: 3
}

const ASSERT_SOURCE = {
	HEADERS: 1,
	JSON_BODY: 2,
	RESPONSE_SIZE: 3,
	RESPONSE_TIME: 4,
	STATUS_CODE: 5,
	TEXT_BODY: 6,
	XML_BODY: 7,
	REGULAR_EXPRESSION: 8
}

const ASSERT = {
	ATTRIBUTE_CONTAINS: 1,
	ATTRIBUTE_DOES_NOT_CONTAIN: 2,
	ATTRIBUTE_DOES_NOT_EXIST: 3,
	ATTRIBUTE_EXISTS: 4,
	CONTAINS: 5,
	DOES_NOT_CONTAIN: 6,
	DOES_NOT_EXIST: 7,
	MATCHES: 8,
	DOES_NOT_MATCH: 9,
	EXISTS: 10,
	FILE_EXISTS: 11,
	CHILD_COUNT: 12
}

const UPLOADS = {
	SERVICE_LOGS: '../uploads/data_migration_tool/service_logs',
}

const COMMANDS = {
	VISIT: 'visit',
	ALERT: 'alert',
	CLICK: 'click',
	CUSTOM_SELECT: 'custom select',
	CHECKBOX: 'checkbox',
	CLICK_BY_TEXT: 'click by text',
	CLOSE_WINDOW: 'close window',
	HOVER: 'hover',
	MOUSE_OUT: 'mouse out',
	MOUSE_DOWN: 'mouse down',
	MOUSE_UP: 'mouse up',
	GOTO_URL: 'goto url',
	SWITCH_TO_IFRAME: 'switch to iframe',
	SWITCH_TO_WINDOW: 'switch to window',
	SCRIPT: 'script',
	TYPE: 'type',
	PASSWORD: 'password',
	DOUBLE_CLICK: 'double click',
	SELECT: 'select',
	KEYPRESS: 'keypress',
	PAUSE: 'pause',
	ASSERT: 'assert',
	ASSERTION: 'assertion',
	STORE_VARIABLE: 'store variable',
	EXECUTE_TEST: 'execute test',
	EXECUTE_API: 'execute api'
}

const OPTIONS = {
	FROM_ELEMENT: 1,
	FROM_JAVASCRIPT: 2
}

const TEST_STATUS = {
	PASS: 'passed',
	FAIL: 'fail'
}

const PATHS = {
	SCREENSHOT_FOLDER: '../selenium/screenshots',
	WEB_FILE: '../selenium/webdata_files',
}

const TYPE = {
	SINGLE_EXECUTION: 1,
	GROUP_EXECUTION: 2,
}

const RUN_TYPE = {
	SEUQENTIAL: 1,
	CONCURRENT: 2,
}

const CONDITIONAL = {
	SCRIPT_RETURNS_TRUE: 1,
	PREVIOUS_STEP_PASSED: 2,
	PREVIOUS_STEP_FAILED: 3,
	PREVIOUS_STEP_SKIPPED: 4,
}

const CONTENT = {
	JSON: 1,
	XML: 2,
	TEXT: 3
}

const CONTENT_TYPE = {
	JSON: 'application/json',
	HTML: 'text/html',
	TEXT: 'text/plain',
	XML: 'application/xml'
}

const FORCE_STOP = true;


const TAKE_SCREEN_SHOTS_OPTIONS = {
	'ALL': 1,
	'PASSED': 2,
	'FAILED': 3,
	'NONE': 4
}

const TEST_CONFIG_OPTIONS = {
	TAKE_SCREEN_SHOT: 'screen_shot_type',
	HIGHLIGHT_DOM_ELEMENTS: 'highlight_dom_elements',
	VISIT_TIMEOUT: 'visit_timeout',
	WAIT_FOR_AJAX: 'wait_for_ajax',
	SCROLL_TO_ELEMENT: 'scroll_to_element',
	REFINE_TARGETS: 'refine_targets'
}

module.exports = {
	ERRORS,
	HISTORY_DATES,
	BROWSERS,
	DAYS,
	INVITE_STATUS,
	PLAN_LIMITS,
	SOMETHING_WENT_WRONG,
	PERMISSIONS_NEW,
	PERMISSION_NAMES,
	NODE_MAILER_CONFIG,
	SUITE,
	CONDITIONS,
	EXECUTION,
	PROTOCOL,
	UPLOADS,
	COMMANDS,
	OPTIONS,
	TEST_STATUS,
	PATHS,
	TYPE,
	RUN_TYPE,
	CONDITIONAL,
	ASSERT,
	CONTENT,
	CONTENT_TYPE,
	API_CONDITIONS,
	API_TYPE,
	ASSERT_SOURCE,
	FORCE_STOP,
	TAKE_SCREEN_SHOTS_OPTIONS,
	TEST_CONFIG_OPTIONS,
	INVALID_PARAMS
}


