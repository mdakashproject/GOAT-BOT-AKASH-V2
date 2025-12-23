"use strict";

const generateOfflineThreadingId = require('../utils');

function canBeCalled(func) {
	try {
		Reflect.apply(func, null, []);
		return true;
	} catch (error) {
		return false;
	}
}

module.exports = function (defaultFuncs, api, ctx) {
	return function toggleAdminApproval(threadKey, enabled, callback) {
		if (!ctx.mqttClient) {
			throw new Error('Not connected to MQTT');
		}

		if (typeof threadKey !== 'string' || typeof enabled !== 'boolean') {
			throw new Error('Invalid threadKey or enabled value'); 
		}

		ctx.wsReqNumber += 1;
		ctx.wsTaskNumber += 1;

		const queryPayload = {
			thread_key: threadKey,
			enabled: enabled ? 1 : 0,
			sync_group: 1
		};

		const query = {
			failure_count: null,
			label: '28',
			payload: JSON.stringify(queryPayload),
			queue_name: 'set_needs_admin_approval_for_new_participant',
			task_id: ctx.wsTaskNumber
		};

		const context = {
			app_id: '772021112871879',
			payload: {
				data_trace_id: null,
				epoch_id: parseInt(generateOfflineThreadingId), //Idk why '-' 
				tasks: [query],
				version_id: '8595046457214655'
			},
			request_id: ctx.wsReqNumber,
			type: 3
		};

		context.payload = JSON.stringify(context.payload);

		ctx.mqttClient.publish('/ls_req', JSON.stringify(context), { qos: 1, retain: false }, (err) => {
			if (err) {
				console.error('Failed to publish:', err);
				if (callback) callback(err); 
			} else {
				console.log('Published successfully:', context);
				if (callback) callback(null, context); 
			}
		});
	};
};
