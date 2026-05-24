package module_define

type Module struct {
	Code        string `db:"code"`
	Name        string `db:"name"`
	Secret      string `db:"secret"`
	Description string `db:"description"`
}

type Config struct {
	NatsURL      string `json:"NatsUrl"`
	NatsUsername string `json:"NatsUsername"`
	NatsPassword string `json:"NatsPassword"`
	DBHost       string `json:"DBHost"`
	DBUsername   string `json:"DBUsername"`
	DBPassword   string `json:"DBPassword"`
	DBLocation   string `json:"DBLocation"`
}
