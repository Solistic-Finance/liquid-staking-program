import { addValidator } from "../../../instructions/baseInstructions/admin";
import { voteAccount } from "../../../voteAccounts";
import { 
    // connectionDevnet as connection,
    connection, 
    admin, 
} from "../../../config";

const addValidators = async () => {
    const addValidatorParam1 = {
        score: 11,
        voteAccount: voteAccount[0]
    }

    await  addValidator(connection, admin, addValidatorParam1)

    const addValidatorParam2 = {
        score: 11,
        voteAccount: voteAccount[1]
    }

    await  addValidator(connection, admin, addValidatorParam2)

    const addValidatorParam3 = {
        score: 11,
        voteAccount: voteAccount[2]
    }

    await  addValidator(connection, admin, addValidatorParam3)
}

addValidators().then(() => {
    console.log("Add Validators completed")
}).catch((err) => {
    console.log("Error in addValidators : ", err)
})