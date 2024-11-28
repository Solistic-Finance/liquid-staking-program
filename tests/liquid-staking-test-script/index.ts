import {
    _preRequisite,
    _initialize,
    _change_authority,
    _add_validator,
    _remove_validator,
    _set_validator_score,
    _config_validator_system,
    _deposit_stake_account,
    _liquid_unstake,
    _add_liquidity,
    _remove_liquidity,
    _config_lp,
    _config_marinade,
    _order_unstake,
    _claim,
    _stake_reserve,
    _update_active,
    _update_deactivated,
    _deactivate_stake,
} from "./src/order";


const main = async () => {
    // await _preRequisite()
    // await _initialize()
    // await _change_authority()
    // await _add_validator()
    // await _remove_validator()
    // await _set_validator_score()
    // await _config_validator_system()
    // await _deposit()
    // await _deposit_stake_account()
    // await _liquid_unstake()
    // await _add_liquidity()
    // await _remove_liquidity()
    // await _config_lp()
    // await _config_marinade()
    // await _order_unstake()
    // await _claim()      //  should invoke after expiration //    double check
    // await _stake_reserve()      //  check
    // await _update_active()

    //  require deactivated or deactivating (deactivation_epoch != u64::MAX)
    //  Logs: 
    //   [
    //     "Program Bu24e3vBZXgFtB9X2BrMysGx99VR5bgf5vupn3YALzDG invoke [1]",
    //     "Program log: Instruction: UpdateDeactivated",
    //     "Program log: AnchorError thrown in programs/marinade-forking-smart-contract/src/instructions/crank/update.rs:439. Error Code: RequiredDeactivatingStake. Error Number: 6045. Error Message: Required deactivating stake.",
    //     "Program log: Left: 18446744073709551615",
    //     "Program log: Right: 18446744073709551615",
    //     "Program Bu24e3vBZXgFtB9X2BrMysGx99VR5bgf5vupn3YALzDG consumed 25219 of 200000 compute units",
    //     "Program Bu24e3vBZXgFtB9X2BrMysGx99VR5bgf5vupn3YALzDG failed: custom program error: 0x179d"
    //   ]
    // await _update_deactivated()

    await _deactivate_stake()

    
}

main()