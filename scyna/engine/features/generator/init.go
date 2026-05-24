package generator

import (
	"log"

	scyna "github.com/scyna/core"
	scyna_const "github.com/scyna/core/const"
)

const idPartitionSize = 1000
const tryCount = 10
const snPartitionSize = 500

func init() {
	scyna.RegisterEndpoint(scyna_const.GEN_GET_ID_URL, GetID)
	scyna.RegisterEndpoint(scyna_const.GEN_GET_SN_URL, GetSN)
	scyna.RegisterSetup(setup)
}

func setup() {
	log.Print("Start id generator")
	for i := 0; i < tryCount; i++ {
		if ok, prefix, start, end := allocate(); ok {
			scyna.ID.Reset(prefix, end, start)
			return
		}
	}
	panic("Can not start id generator")
}
