import {
    _preRequisite,
    _initialize,
    _change_authority,
    _add_validator,
    _remove_validator,
    _set_validator_score,
    _config_validator_system,
} from "./src/order";
import { _deposit } from "./src/order/_deposit";


const main = async () => {
    // await _preRequisite()
    // await _initialize()
    // await _change_authority()
    // await _add_validator()
    // await _remove_validator()
    // await _set_validator_score()
    // await _config_validator_system()
    await _deposit()
}

main()