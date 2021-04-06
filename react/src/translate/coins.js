// List of coin names organized by protocol type

const coins = {
  BTC: {
    VRSC: 'Verus',
    KMD: 'Komodo',
    BTC: 'Bitcoin',
    VOTE2020: 'VOTE2020',
    KSB: 'KSB',
    MORTY: 'Morty',
    RICK: 'Rick',
    OUR: 'Ourcoin',
    BET: 'BET',
    BOTS: 'BOTS',
    CEAL: 'CEAL NET',
    COQUI: 'COQUI',
    KMDICE: 'KMDICE',
    CHAIN: 'Chainmakers',
    GLXT: 'GLXToken',
    EQL: 'Equaliser',
    CRYPTO: 'CRYPTO',
    HODL: 'HODL',
    DEX: 'DEX',
    JUMBLR: 'JUMBLR',
    KV: 'KV',
    MGW: 'MultiGateway',
    MVP: 'MVP Lineup',
    PANGEA: 'PANGEA',
    PGT: 'Pungo',
    REVS: 'REVS',
    MSHARK: 'MSHARK',
    MESH: 'SpaceMesh',
    SUPERNET: 'SUPERNET',
    WLC21: 'WirelessCoin',
    AXO: 'AXO',
    ETOMIC: 'ETOMIC',
    BEER: 'BEER (Test coin)',
    PIZZA: 'PIZZA (Test coin)',
    NINJA: 'NINJA',
    GLXT: 'GLXToken',
    BNTN: 'Blocnation',
    PRLPAY: 'Pearl Pay',
    OOT: 'Utrum',
    ZILLA: 'ChainZilla',
    DSEC: 'DevSec',
    MGNX: 'MagnaX',
    CCL: 'CoinCollect',
    PIRATE: 'Pirate',
    KOIN: 'Koinon Coin',
    DION: 'DionPay',
    PTX: 'PatentTX',
    ZEXO: 'Zaddex',
    SPLTEST: 'Sapling Test Chain',
    LABS: 'LABS',
    MTST3: 'MTST3',
    DP: 'DigitalPrice',
    VRSCTEST: 'Verus Testnet',
    MTST3: 'MTST3',
    LABS: 'LABS',
    CLF: 'CryptoLeaf',
    KEA: 'KEA',
    OVAL: 'OVAL',
    TILE: 'TILE',
    TRET: 'TRET',
    JST: 'JST',
    DEC8: 'DEC8',
    BTCP: 'BitcoinPrivate',
    //SMART: 'Smartcash',
    FTC: 'FeatherCoin',
    //LCC: 'Litecoin Cash',
    //MNX: 'MinexCoin',
    //UNO: 'Unobtanium',
    //XVG: 'Verge',
    EMC2: 'Einsteinium',
    XZC: 'Zcoin',
    FJC: 'Fujicoin',
    GAME: 'GameCredits',
    BTG: 'BitcoinGold',
    BCH: 'BitcoinCash',
    DASH: 'Dash',
    DGB: 'DigiByte',
    FAIR: 'Faircoin',
    LTC: 'Litecoin',
    MONA: 'Monacoin',
    NMC: 'Namecoin',
    VTC: 'Vertcoin',
    VIA: 'Viacoin',
    SIB: 'Sibcoin',
    BLK: 'Blackcoin',
    DOGE: 'Dogecoin',
    ZEC: 'Zcash',
    SNG: 'SnowGem',
    ZCL: 'Zclassic',
    XMY: 'Myriad',
    GRS: 'Groestlcoin',
    HODLC: 'Hodl coin',
    SUQA: 'SUQA',
    BTX: 'Bitcore',
    QTUM: 'Qtum',
    BTCZ: 'BitcoinZ',
    CHIPS: 'Chips',
    ERC: 'Europecoin',
    //XBC: 'BitcoinPlus',
    //ZET: 'Zetacoin',
    //AXE: 'Axe',
    //MZC: 'Mazacoin',
    BZC: 'Bitzec',
  },
  ETH: {
    ETH: 'Ethereum',
  },
  ERC20: {
    RFOX: 'RedFOX Labs',
    AE: 'Aeternity',
    ANN: 'Agent Not Needed',
    BFT: 'BnkToTheFuture',
    BIO: 'BioCrypt',
    BITSOKO: 'Bitsoko',
    BLZ: 'Bluzelle',
    BOX: 'Beonbox',
    BTCL: 'BTC Lite',
    BTO: 'Bottos',
    CENNZ: 'Centrality',
    CS: 'Credits',
    CYFR: 'CyphrCoin',
    DATA: 'Streamr DATAcoin',
    ELD: 'Electrum Dark',
    ENG: 'Enigma',
    ETA: 'Etheera',
    ETK: 'EnergiToken',
    FOOD: 'FoodCoin',
    GMBEL: 'G-Mbel',
    GPN: 'GPN Coin',
    GROW: 'Grow',
    GTC: 'Game.com',
    GTO: 'Gifto',
    HT: 'Huobi Token',
    HTS: 'Hostingicos',
    ITL: 'Italian Lira',
    JOI: 'JointEDU',
    KICK: 'KickCoin',
    LIKE: 'LikeCoin',
    LINK: 'ChainLink',
    LTR: 'Labtorum',
    LYS: 'Lightyears',
    MAN: 'Matrix AI Network',
    MMX: 'Mechanix Token',
    MRPH: 'Morpheus Network',
    MTF: 'MintFlint Token',
    MYB: 'MyBit Token',
    NOAH: 'Noah Coin',
    NPXS: 'Pundi X',
    NS21: 'PeachCoin',
    //NULS: 'Nuls',
    OCC: 'Original Crypto Coin',
    PAO: 'Pacific Ocean',
    PCL: 'Peculium',
    PCNC: 'PCN Coin',
    PEP: 'PesaPepe',
    PGTS: 'Puregold Token',
    POLY: 'Polymath',
    PURC: 'Peurcoin',
    QBIT: 'Qubitica',
    QKC: 'QuarkChain',
    RUFF: 'Ruff',
    RVT: 'Rivetz',
    SPANK: 'SpankChain',
    STRM41: 'Stream41',
    SUB: 'Substratum',
    SVD: 'Savedroid',
    THETA: 'Theta Token',
    TRAT: 'Tratok',
    CIX: 'Cryptonetix',
    DCN: 'Dentacoin',
    ELY: 'Elysian',
    DROP: 'Dropil',
    DRT: 'DomRaider',
    ELF: 'aelf',
    RLTY: 'SMARTRealty',
    PXT: 'Populous XBRL Token',
    STORM: 'Storm',
    TUSD: 'TrueUSD',
    WAX: 'WAX',
    KIN: 'Kin',
    LALA: 'LALA World',
    ONNI: 'Misericordae',
    PAT: 'Pangea Arbitration Token',
    USDT: 'Tether',
    BBT: 'Bitboost',
    OCT: 'Octus',
    OMG: 'OmiseGo',
    R: 'Revain',
    UCASH: 'U.CASH',
    //BNB: 'Binance Coin',
    BTK: 'BitcoinToken',
    DAI: 'Dai',
    DDD: 'Scry.info',
    DGD: 'DigixDAO',
    DGPT: 'DigiPulse',
    DRGN: 'Dragonchain',
    FLLW: 'FollowCoin',
    FSN: 'Fusion',
    HYD: 'Hydra',
    IOST: 'IOST',
    PPT: 'Populous',
    LRC: 'Loopring',
    MDS: 'MediShares',
    MKR: 'Maker',
    SNT: 'Status',
    REP: 'Augur',
    SRN: 'SIRIN LABS Token',
    YLC: 'YoloCash',
    ZRX: '0x',
    BAT: 'Basic Attention Token',
    ETHOS: 'Ethos',
    QASH: 'Qash',
    FUN: 'FunFair',
    KNC: 'Kyber Network',
    SALT: 'Salt',
    BNT: 'Bancor',
    ICN: 'Iconomi',
    LUPX: 'Lupecoin',
    PAY: 'TenX',
    REQ: 'Request Network',
    STORJ: 'Storj',
    STWY: 'StorweeyToken',
    GNO: 'Gnosis',
    RLC: 'iExec RLC',
    ENJ: 'Enjin Coin',
    QSP: 'Quantstamp',
    RDN: 'Raiden Network Token',
    WTC: 'Waltonchain',
    CVC: 'Civic',
    SAN: 'Santiment',
    ANT: 'Aragon',
    LOOM: 'Loom Network',
    MANA: 'Decentraland',
    MCO: 'Monaco',
    MGO: 'MobileGo',
    MTL: 'Metal',
    EDG: 'Edgeless',
    MLN: 'Melon',
    AMB: 'Ambrosus',
    WINGS: 'Wings',
    POWR: 'Power Ledger',
    PRL: 'Oyster',
    RHOC: 'RChain',
    RCN: 'Ripio Credit Network',
    SANC: 'Sancoj',
    SNGLS: 'SingularDTV',
    TAAS: 'TaaS',
    DNT: 'District0x',
    CFI: 'Cofound.it',
    LUN: 'Lunyr',
    ADT: 'adToken',
    AST: 'AirSwap',
    CDT: 'Blox',
    TKN: 'TokenCard',
    HMQ: 'Humaniq',
    BCAP: 'Bcap',
    NMR: 'Numeraire',
    TRST: 'Trust',
    GUP: 'Matchpool',
    '1ST': 'FirstBlood',
    TIME: 'Chronobank',
    SWT: 'Swarm City',
    DICE: 'Etheroll',
    XAUR: 'Xarum',
    XOV: 'XOVBank',
    PLU: 'Pluton',
    HGT: 'HelloGold',
    VSL: 'vSlice',
    IND: 'Indorse Token',
    FYN: 'FundYourselfNow',
    //TODO: Get erc20 contract ID for eos
    //EOS: 'EOS',
    ZIL: 'Zilliqa',
    //OCALL: 'Old Capital',
    //CALLG: 'Capital GAS',
    //TST: "Ropsten Test ERC20"
  }
};

module.exports = coins;
