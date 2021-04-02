
// Coin modes and states
export const NATIVE = 'native'
export const LITE = 'lite'
export const ETH = 'eth'
export const ELECTRUM = 'electrum'
export const PRE_DATA = 'pre_data' // Before any API calls yield useful information (initialization)
export const SYNCING = 'syncing' // Before blockchain is fully synced, while API does give useful info
export const POST_SYNC = 'post_sync' // After data is accesable and blockchain is fully synced
export const IS_ZCASH = 'is_zcash'
export const IS_PBAAS = 'is_pbaas'
export const IS_PBAAS_ROOT = 'is_pbaas_root'
export const IS_SAPLING = 'is_sapling'
export const Z_ONLY = 'z_only'
export const IS_VERUS = 'is_verus'

// Recurring API Call names
export const API_GET_BALANCES = 'get_balances'
export const API_GET_TRANSACTIONS = 'get_transactions'
export const API_GET_RESERVE_TRANSFERS = 'get_reserve_transfers'
export const API_GET_INFO = 'get_info'
export const API_GET_DEFINEDCHAINS = 'get_definedchains'
export const API_GET_BLOCKREWARD = 'get_blocksubsidy'
export const API_GET_CURRENTSUPPLY = 'get_currentsupply'
export const API_GET_ZOPERATIONSTATUSES = 'get_zoperations'
export const API_GET_MININGINFO = 'get_mininginfo'
export const API_GET_ADDRESSES = 'get_addresses'
export const API_GET_FIATPRICE = 'get_fiatprice'
export const API_GET_IDENTITIES = 'get_identities'
export const API_GET_ALL_CURRENCIES = 'get_all_currencies'
export const API_GET_CURRENCY_DATA_MAP = 'get_currency_data_map'
export const API_GET_NAME_COMMITMENTS = 'get_name_commitments'

// Singleton API call names
export const API_GET_PRIVKEY = 'get_privkey'
export const API_GET_PUBKEY = 'get_pubkey'
export const API_GET_IDENTITY = 'get_identity'
export const API_GET_CURRENCY = 'get_currency'
export const API_STOP = 'stop'
export const API_CALL_DAEMON = 'call_daemon'
export const API_GET_NETWORK_FEES = 'get_networkfees'
export const API_GET_CURRENCY_CONVERSION_PATHS = 'get_conversion_paths'
export const API_GET_RFOX_ESTIMATE_GAS_CLAIM_ACCOUNT_BALANCES = 'rfox/estimate_gas_claim_account_balances'
export const API_GET_RFOX_GET_ACCOUNT_BALANCES = 'rfox/get_account_balances'

// Write API call names
export const API_CREATE_ADDRESS = 'get_newaddress'
export const API_TX_PREFLIGHT = 'tx_preflight'
export const API_SENDTX = 'sendtx'
export const API_SENDCURRENCY = 'sendcurrency'
export const API_REGISTER_ID_NAME = 'register_id_name'
export const API_REGISTER_ID = 'register_id'
export const API_RECOVER_ID = 'recover_id'
export const API_UPDATE_ID = 'update_id'
export const API_REVOKE_ID = 'revoke_id'
export const API_RECOVER_ID_PREFLIGHT = 'recover_id_preflight'
export const API_UPDATE_ID_PREFLIGHT = 'update_id_preflight'
export const API_REGISTER_ID_NAME_PREFLIGHT = 'register_id_name_preflight'
export const API_REGISTER_ID_PREFLIGHT = 'register_id_preflight'
export const API_DELETE_NAME_COMMITMENT = 'delete_name_commitment'
export const API_SIGN_MESSAGE = 'sign_message'
export const API_SIGN_FILE = 'sign_file'
export const API_VERIFY_MESSAGE = 'verify_message'
export const API_VERIFY_FILE = 'verify_file'
export const API_VERIFY_HASH = 'verify_hash'
export const API_START_MINING = 'start_mining'
export const API_STOP_MINING = 'stop_mining'
export const API_START_STAKING = 'start_staking'
export const API_STOP_STAKING = 'stop_staking'
export const API_SHIELDCOINBASE = 'shieldcoinbase'
export const API_SHIELDCOINBASE_PREFLIGHT = 'shieldcoinbase_preflight'
export const API_RFOX_CLAIM_BALANCES = 'rfox/claim_account_balances'
export const API_LOGIN_USER = 'users/login'
export const API_LOGOUT_USER = 'users/logout'
export const API_GET_CURRENT_USER = 'users/current'

// Non-blockchain API call paths
export const LOAD_USERS = 'users/load'
export const SAVE_USERS = 'users/save'
export const BACKUP_USERS = 'users/backup'
export const RESET_USERS = 'users/reset'
export const LOAD_CONFIG = 'config/load'
export const SAVE_CONFIG = 'config/save'
export const RESET_CONFIG = 'config/reset'
export const GET_SCHEMA = 'config/schema'
export const ENCRYPT_KEY = 'encryptkey'
export const DECRYPT_KEY = 'decryptkey'
export const API_ACTIVATE_COIN = 'coins/activate'
export const API_REMOVE_COIN = 'remove_coin'
export const CHECK_ZCASH_PARAMS = 'zcashparamsexist'
export const DL_ZCASH_PARAMS = 'zcparamsdl'
export const AUTHENTICATE = 'auth'
export const CHECK_AUTHENTICATION = 'check_auth'
export const LOG_OUT = 'logout' 
export const GET_STATIC_SYSTEM_DATA = 'get_static_system_data'
export const API_GET_CPU_TEMP = 'get_cpu_temp'
export const API_GET_CPU_LOAD = 'get_cpu_load'
export const API_GET_SYS_TIME = 'get_sys_time'
export const API_LOAD_LOCAL_BLACKLIST = 'load_currency_blacklist'
export const API_LOAD_LOCAL_WHITELIST = 'load_currency_whitelist'
export const API_SAVE_LOCAL_BLACKLIST = 'save_currency_blacklist'
export const API_SAVE_LOCAL_WHITELIST = 'save_currency_whitelist'
export const API_SAVE_UPDATE_LOG = 'save_update_log'
export const API_LOAD_UPDATE_LOG = 'load_update_log'
export const API_BACKUP_APPDATA = 'backup_appdata'
export const API_EXPORT_TX_CSV = 'export_transaction_csv'

// Local Currency Lists 
export const BLACKLISTS = 'blacklists'
export const WHITELISTS = 'whitelists'

// API call request types
export const POST = 'post'
export const GET = 'get'

// Conditional update responses
export const API_ABORTED = 'aborted'
export const API_SUCCESS = 'success'
export const API_ERROR = 'error'
export const API_FAILED = 'failed'
export const API_UNSUPPORTED_SYSTEM_CALL = 'unsupported_operation'

// API Fetch update intervals
export const ALWAYS_ACTIVATED = 0
export const NEVER_ACTIVATED = -1

// PBaaS Convert
export const QUICK_CONVERT = 'quick_convert'
export const CONTROL_CENTER = 'control_center'
export const QUICK_CONVERT_FORM_TITLES = ['FILL_CONVERT_FORM', 'CONFIRMING_CONVERSION', 'PROCESSING_CONVERSION']
export const BUY = 'buy'
export const SELL = 'sell'

// PBaaS Main Screen
export const CONNECT = 'connect'
export const CREATE = 'create'
export const DISCOVER = 'discover'
export const HELP = 'help'
export const CONVERT = 'convert'

// PBaaS Create Screen
export const EXPONENTIAL = 'exponential'
export const LINEAR = 'linear'
export const END = 'END'
export const FREQUENCY = 'FREQUENCY'
export const MAGNITUDE = 'MAGNITUDE'
export const LINEAR_DECAY = 100000000
export const MIN_BILLING_PERIOD = 480
export const FORM_TITLES = ['NAME', 'LAUNCH_OPTIONS', 'REWARD_STRUCTURE', 'BILLING', 'NODES', 'CONFIRM']

// Currency Conversion Overview
export const COPY_TRANSFER_TXID = 'Copy Transaction ID'
export const MORE_INFO = "More Info"
export const VIEW_TRANSFER_ON_EXPLORER = 'View on Explorer'

// Add coin and login modal and screen
export const SEED_TRIM_TIMEOUT = 5000
export const DEFAULT_CHAIN = "defaultChain.png"
export const VERUS_DAEMON = 'verusd'
export const TEST_CHAINS = ['BEER', 'PIZZA', 'VOTE2018']

// Main Wallet
export const MAX_COINNAME_DISPLAY_LENGTH = 10
export const COINS_TO_SKIP = ['KMD', 'JUMBLR', 'MESH', 'MVP']
export const BOTTOM_BAR_DISPLAY_THRESHOLD = 15

// Main Navigation
export const PRE_AUTH = 'pre_auth'
export const POST_AUTH = 'post_auth'
export const UX_SELECTOR = 'ux_selector'
export const MINING = 'mining'
export const MULTIVERSE = 'multiverse'
export const WALLET = 'wallet'
export const PBAAS = 'pbaas'
export const VERUSID = 'verus_id'
export const SETTINGS = 'settings'
export const IDENTITIES = 'identities'
export const CREATE_PROFILE = 'create_profile'
export const SELECT_PROFILE = 'select_profile'
export const UNLOCK_PROFILE = 'unlock_profile'
export const APPS = 'apps'
export const DASHBOARD = 'dashboard'
export const CHAIN_POSTFIX = 'chain'
export const ID_POSTFIX = 'identity'
export const MINING_POSTFIX = 'mining'
export const LOGIN = 'login'
export const SETUP = 'setup'
export const SIGN_UP = 'sign_up'

// Modal navigation
export const BASIC_MODAL = 'basic_modal'
export const SPLIT_MODAL = 'split_modal'

export const ADD_COIN = 'add_coin'
export const CHAIN_INFO = 'chain_info'
export const PBAAS_CHAIN_INFO = 'pbaas_chain_info'
export const RECEIVE_COIN = 'receive_coin'
export const SEND_COIN = 'send_coin'
export const SHIELDCOINBASE = 'shieldcoinbase'
export const CREATE_IDENTITY = 'create_identity'
export const SIGN_VERIFY_ID_DATA = 'sign_verify_id_data'
export const VERIFY_ID_DATA = 'verify_id_data'
export const SIGN_ID_DATA = 'sign_id_data'
export const TX_INFO = 'tx_info'
export const CSV_EXPORT = 'csv_export'
export const OPERATION_INFO = 'operation_info'
export const ID_INFO = 'id_info'
export const CURRENCY_INFO = 'currency_info'
export const SELECT_COIN = 'select_coin'
export const CONFIGURE_LITE = 'configure_lite'
export const CONFIGURE_NATIVE = 'configure_native'
export const CONFIGURE = 'configure'
export const IMMATURE_DETAILS = 'immature_details'
export const CONVERT_CURRENCY = 'convert_currency'

// Coin object data
export const DEFAULT_DUST_THRESHOLD = 0.00001
export const DEFAULT_DAEMON = 'verusd'
export const ZCASH_DAEMON = 'zcashd'
export const KOMODO_DAEMON = 'komodod'
export const ZCASH_CONF_NAME = 'zcash'
export const KOMODO_CONF_NAME = 'komodo'

// Coin wallet screen
export const NATIVE_BALANCE = 'native'
export const RESERVE_BALANCE = 'reserve'
export const PRIVATE_BALANCE = 'private'
export const PUBLIC_BALANCE = 'public'
export const CONFIRMED_BALANCE = 'confirmed'
export const TRANSPARENT_BALANCE = 'transparent'
export const IMMATURE_BALANCE = 'immature'
export const INTEREST_BALANCE = 'interest'
export const UNCONFIRMED_BALANCE = 'unconfirmed'
export const STAKING_BALANCE = 'staking'
export const NO_BALANCE = 'None'
export const UNKNOWN_BALANCE = '?'
export const FUND = 'fund'
export const SEND = 'send'
export const DARK_CARD = 'dark'
export const LIGHT_CARD = 'light'
export const SYNCING_CHAIN = 'Syncing with blockchain...'
export const WALLET_CONNECTED = 'Wallet connected.'
export const FINDING_LONGEST_CHAIN = 'Finding longest chain, possibly forked...'
export const CONNECTING_TO_PEERS = 'Connecting to peers...'

// Transaction information
export const MINED_TX = 'generate'
export const MINTED_TX = 'mint'
export const IN_TX = 'receive'
export const IN_TX_ELECTRUM = 'received'
export const OUT_TX = 'send'
export const OUT_TX_ELECTRUM = 'sent'
export const SELF_TX = 'self'
export const STAKE_TX = 'stake'
export const IMMATURE_TX = 'immature'
export const UNKNOWN_TX = 'unknown'
export const INTEREST_TX = 'interest'
export const REJECTED_CONFIRMATIONS = -1

// Fallback image 
export const CHAIN_FALLBACK_IMAGE = 'assets/images/cryptologo/defaultChain.png'

// Addcoin native options
export const NATIVE_RESCAN = '-rescan'
export const NATIVE_REINDEX = '-reindex'
export const NATIVE_STAKE = '-mint'
export const NATIVE_MINE = '-gen'
export const NATIVE_MINE_THREADS = '-genproclimit='

// ZCash params 
export const ZCPARAMS_VERUS = 'verus.io'
export const ZCPARAMS_KOMODO = 'agama.komodoplatform.com'
export const ZCPARAMS_ZCASH = 'z.cash'
export const ZCPARAMS_SOCKET = 'zcparams'
export const ADDCOIN_DELAY = 500

// Addcoin electrum options
export const ELECTRUM_NSPV = '-nspv'

// Password and seed entering
export const PWD_STRENGTH_THRESHOLD = 29

// Receive coin screen
export const PRIVATE_ADDRS = 'private'
export const PUBLIC_ADDRS = 'public'
export const COPY_PUBKEY = 'Copy public key'
export const COPY_PRIVKEY = 'Copy private key'
export const GENERATE_QR = 'Generate QR-Code'
export const REVEAL_PRIVKEY = 'Reveal private key'
export const SAPLING_ADDR = 'sapling'
export const SPROUT_ADDR = 'sprout'

// Tx Info Modal
export const GENERAL_INFO = 'General Info'
export const RAW_TX = 'Raw Transaction'
export const TX_EXPLORER = 'Explorer'
export const TX_MESSAGE = 'Message'
export const TX_HEX = 'Hex'

// Snackbar types
export const ERROR_SNACK = 'error'
export const INFO_SNACK = 'info'
export const SUCCESS_SNACK = 'success'
export const WARNING_SNACK = 'warning'
export const MID_LENGTH_ALERT = 6000
export const LONG_ALERT = 12000

// Settings screen
export const PROFILE_SETTINGS = 'profile_settings'
export const GENERAL_SETTINGS = 'general_settings'
export const COIN_SETTINGS = 'coin_settings'

// Profile Settings
export const START_AT_LAST_LOCATION = 'start_at_last_location'
export const CUSTOM_START_LOCATION = 'custom_start_location'
export const PLACEHOLDER = 'placeholder'

// General Settings 
export const MAIN_SETTINGS = 'main'
export const HOST = 'host'
export const APP_PORT = 'agamaPort'
export const SPV_USE_PROXY = 'proxy'
export const SPV_SOCKET_TIMEOUT = 'spv.socketTimeout'
export const SPV_MAX_TX_LENGTH = 'spv.maxTxListLength'
export const NATIVE_CLI_STOP_TIMEOUT = 'native.cliStopTimeout'
export const NATIVE_MAX_TX_LENGTH = 'native.maxTxListLength'
export const NATIVE_ZCASH_PARAMS_SRC = 'native.zcashParamsSrc'
export const DROPDOWN = 'dropdown'
export const TEXT_INPUT = 'text_input'
export const NUMBER_INPUT = 'number_input'
export const DECIMAL_INPUT = 'decimal_input'
export const CHIPS_DISPLAY = 'chips_display'
export const CHECKBOX = 'checkbox'
export const STAKE_GUARD = 'stakeGuard'
export const DATA_DIR = 'dataDir'

// Send coin form 
export const TRANSPARENT_FUNDS = 'Transparent Funds'
export const CONFIRMED_TRANSPARENT_FUNDS = 'Confirmed transparent funds'

// Shield coinbase form
export const ALL_UNSHIELDED_FUNDS = 'All unshielded funds'

// Send coin
export const ENTER_DATA = 0
export const CONFIRM_DATA = 1
export const SEND_RESULT = 2

// Send coin form errors
export const ERROR_INVALID_ADDR = 'Invalid address'
export const ERROR_INVALID_AMOUNT = 'Invalid send amount'
export const ERROR_INVALID_FROM = 'Invalid from address'
export const ERROR_AMOUNT_MORE_THAN_BALANCE = 'Amount is more than available balance.'
export const ERROR_Z_AND_NO_FROM = 'Sending a Z transaction requires a from address.'
export const ERROR_Z_NOT_SUPPORTED = 'Private transactions are not supported in this mode.'
export const ERROR_NO_Z_INTEREST = 'You must claim interest to a public address.'
export const ERROR_INVALID_ID = 'Invalid identity, identities must start with an \'i\' or end in an \'@\'.'

// Send coin preflight obj keys
export const TXDATA_TO = 'to'
export const TXDATA_FROM = 'from'
export const TXDATA_FROM_CURRENCY = 'fromCurrency'
export const TXDATA_TO_CURRENCY = 'toCurrency'
export const TXDATA_VALUE = 'value'
export const TXDATA_FEE = 'fee'
export const TXDATA_TOTAL_AMOUNT = 'total'
export const TXDATA_BALANCE = 'balance'
export const TXDATA_INTEREST = 'interest'
export const TXDATA_REMAINING_BALANCE = 'remainingBalance'
export const TXDATA_LAST_PRICE = 'lastPrice'
export const TXDATA_STATUS = 'status'
export const TXDATA_ERROR = 'error'
export const TXDATA_TXID = 'txid'
export const TXDATA_MESSAGE = 'message'
export const TXDATA_PRICE = 'price'
export const TXDATA_CONVERSION_VALUE = 'conversionValue'

// Shield coinbase obj keys
export const TXDATA_OPID = 'opid'
export const TXDATA_SHIELDVAL = 'shieldingValue'
export const TXDATA_REMAININGVAL = 'remainingValue'
export const TXDATA_FROMADDR = 'fromAddress'
export const TXDATA_TOADDR = 'toAddress'

// Send command types
export const Z_SEND = 'z_sendmany'
export const SEND_TO_ADDRESS = 'sendtoaddress'
export const SEND_CURRENCY = 'sendcurrency'

// Create Identity form errors
export const ERROR_NAME_REQUIRED = 'A name is required'
export const ERROR_INVALID_Z_ADDR = 'Invalid private address'

// Create identity defaults
export const DEFAULT_REFERRAL_ID = 'Verus Coin Foundation@'

// Mining states
export const MS_IDLE = 'idle'
export const MS_OFF = 'off'
export const MS_MINING = 'mining'
export const MS_STAKING = 'staking'
export const MS_MINING_STAKING = 'mining_staking'
export const MS_MERGE_MINING = 'merge_mining'
export const MS_MERGE_MINING_STAKING = 'merge_mining_staking'

// Data types for signature verification
export const TEXT_DATA = 0
export const FILE_DATA = 1
export const HASH_DATA = 2

// Generator card types
export const MINING_CARD = 'mining'
export const STAKING_CARD = 'staking'

// Staking warning
export const STAKE_WARNING =
         "This number is based off of the assumption that all of your confirmed " +
         "transparent balance is stakeable. If you have any freshly minted funds, this may not be the case.";
export const STAKE_BALANCE_INFO =
  "This number includes your coins eligible for staking " +
  "(public coins that have been sent at least once since they were mined/staked).";

// Identity statuses
export const ID_ACTIVE = 'active'
export const ID_REVOKED = 'revoked'

// Sections of the app that can load by being indicated as 'loading' in the
// loading reducer
export const MINING_FUNCTIONS = 'mining_functions'

// Conversion modal constants
export const SIMPLE_CONVERSION = 'simple_conversion'
export const ADVANCED_CONVERSION = 'advanced_conversion'
export const CONVERSION_OVERVIEW = 'conversion_overview'

// Plugins API
export const API_INSTALL_PLUGIN = 'plugin/install'
export const API_RUN_PLUGIN = 'plugin/run'
export const API_LIST_PLUGINS = 'plugin/all'
export const API_GET_PLUGIN = 'plugin/get'
export const API_AUTHENTICATE_COIN = 'plugin/builtin/authenticator/authenticate'



