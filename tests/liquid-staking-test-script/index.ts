import {
    _preRequisite,
    _initialize,
    _change_authority,
    _add_validator,
    _remove_validator,
    _set_validator_score,
} from "./src/order";


const main = async () => {
    // await _preRequisite()
    // await _initialize()
    // await _change_authority()
    // await _add_validator()
    // await _remove_validator()
    await _set_validator_score()
}

main()