import { BN } from "bn.js";
import { connection, payer, program } from "./src/config";
import { initialize, preRequisite } from "./src/instructions";
import { InitializeDataParam } from "./src/types";
import { _initialize, _preRequisite } from "./src/order";


const main = async () => {
    // await _preRequisite()
    // await _initialize()
}


main()