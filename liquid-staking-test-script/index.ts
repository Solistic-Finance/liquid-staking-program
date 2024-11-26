import {
    _preRequisite,
    _initialize,
    _change_authority,
    _add_validator,
} from "./src/order";


const main = async () => {
    // await _preRequisite()
    // await _initialize()
    // await _change_authority()
    await _add_validator()
}

main()