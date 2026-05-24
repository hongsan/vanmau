package main

import (
	"flag"
	"log"
	"net/http"
	"time"

	scyna "github.com/scyna/core"
	scyna_const "github.com/scyna/core/const"
	scyna_proto "github.com/scyna/core/proto"
	_ "github.com/scyna/engine/features/generator"
	_ "github.com/scyna/engine/features/module"
	"github.com/scyna/engine/features/proxy"
	"github.com/scyna/engine/features/scheduler"
	"github.com/scyna/engine/features/session"
	"github.com/scyna/engine/features/setting"
	_ "github.com/scyna/engine/features/trace"
)

const MODULE_CODE = "scyna_engine"

func main() {

	managerPort := flag.String("manager_port", "8082", "Manager Port")
	proxyPort := flag.String("proxy_port", "8080", "Proxy Port")

	natsUrl := flag.String("nats_url", "127.0.0.1", "Nats URL")
	natsUsername := flag.String("nats_username", "", "Nats Username")
	natsPassword := flag.String("nats_password", "", "Nats Password")

	dbHost := flag.String("db_host", "127.0.0.1", "DB Host")
	dbUsername := flag.String("db_username", "", "DB Username")
	dbPassword := flag.String("db_password", "", "DB Password")
	dbLocation := flag.String("db_location", "", "DB Location")
	dbPemFile := flag.String("db_pem_file", "", "DB Pem File")
	dbisAWSKeyspaces := flag.Bool("db_is_aws_keyspaces", false, "DB is AWS Keyspaces")

	secret := flag.String("secret", "123456", "scyna Manager Secret")

	certificateEnable := flag.Bool("certificateEnable", false, "Certificate Key")
	certificateFile := flag.String("certificateFile", "", "Certificate Key")
	certificateKey := flag.String("certificateKey", "", "Certificate File")

	flag.Parse()
	config := scyna_proto.Configuration{
		NatsUrl:        *natsUrl,
		NatsUsername:   *natsUsername,
		NatsPassword:   *natsPassword,
		DBHost:         *dbHost,
		DBUsername:     *dbUsername,
		DBPassword:     *dbPassword,
		DBLocation:     *dbLocation,
		DBPemFile:      *dbPemFile,
		IsAWSKeyspaces: *dbisAWSKeyspaces,
	}

	/* Init module */
	scyna.DirectInit(MODULE_CODE, &config)
	defer scyna.Release()

	session.Init(MODULE_CODE, *secret)
	scyna.UseDirectLog(5)

	/* Update config */
	setting.UpdateDefaultConfig(&config)

	const DEFAULT_CERT_FILE = ".cert/localhost.crt"
	const DEFAULT_CERT_KEY = ".cert/localhost.key"

	if *certificateEnable && (*certificateFile == "" || *certificateKey == "") {
		*certificateFile = DEFAULT_CERT_FILE
		*certificateKey = DEFAULT_CERT_KEY
	}

	go func() {
		proxy_ := proxy.NewProxy()
		log.Println("Scyna Proxy Start with port " + *proxyPort)

		if *certificateEnable && *certificateFile != "" {
			if err := http.ListenAndServeTLS(":"+*proxyPort, *certificateFile, *certificateKey, proxy_); err != nil {
				log.Println("Proxy: " + err.Error())
			}
		} else {
			if err := http.ListenAndServe(":"+*proxyPort, proxy_); err != nil {
				log.Println("Proxy: " + err.Error())
			}
		}
	}()

	scyna.StartCoreServices()
	/* Start worker */

	scheduler.Start(time.Second * 1)
	http.HandleFunc(scyna_const.SESSION_CREATE_URL, session.CreateSessionHandler)

	log.Println("Scyna Manager Start with port " + *managerPort)
	if *certificateEnable && *certificateFile != "" {
		if err := http.ListenAndServeTLS(":"+*managerPort, *certificateFile, *certificateKey, nil); err != nil {
			panic(err)
		}
	} else {
		if err := http.ListenAndServe(":"+*managerPort, nil); err != nil {
			panic(err)
		}
	}
}
