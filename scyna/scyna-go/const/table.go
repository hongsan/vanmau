package scyna_const

const (
	MODULE_TABLE              = KEYSPACE + ".module"
	CLIENT_TABLE              = KEYSPACE + ".client"
	CLIENT_USE_ENDPOINT_TABLE = KEYSPACE + ".client_use_endpoint"
	SETTING_TABLE             = KEYSPACE + ".setting"
	GEN_ID_TABLE              = KEYSPACE + ".gen_id"
	GEN_SN_TABLE              = KEYSPACE + ".gen_sn"
	SESSION_TABLE             = KEYSPACE + ".session"
	TODO_TABLE                = KEYSPACE + ".todo"
	DOING_TABLE               = KEYSPACE + ".doing"
	TASK_TABLE                = KEYSPACE + ".task"
	MODULE_HAS_TASK_TABLE     = KEYSPACE + ".module_has_task"
	TRACE_TABLE               = KEYSPACE + ".trace"
	ENDPOINT_TRACE_TABLE      = KEYSPACE + ".endpoint_trace"
	LOG_TABLE                 = KEYSPACE + ".log"
	STATS_TABLE               = KEYSPACE + ".stats"
	ENDPOINT_MONITOR          = KEYSPACE + ".endpoint_monitor"
	ALERT_CHANNEL_TABLE       = KEYSPACE + ".alert_channel"
	ALERT_HISTORY_TABLE       = KEYSPACE + ".alert_history"
)
