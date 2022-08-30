export const chainsList = [
    {
        name: 'Cosmos',
        value: "cosmoshub",
        rpc: 'https://rpc.cosmos.directory/cosmoshub',
        rest: 'https://rest.cosmos.directory/cosmoshub',
        symbol: 'ATOM',
        denom: "uatom",
        exponent: 6,
        min_tx_fee: ["312", "0"],
        gas: 100000,
        prefix: "cosmos"
    },
    {
        name: 'Osmosis',
        value: "osmosis",
        rpc: 'https://rpc.cosmos.directory/osmosis',
        rest: 'https://rest.cosmos.directory/osmosis',
        symbol: 'OSMO',
        denom: "uosmo",
        exponent: 6,
        min_tx_fee: ["0", "0"],
        gas: 140000,
        prefix: "osmo"
    },
    {
        name: 'Juno',
        value: "juno",
        rpc: 'https://rpc.cosmos.directory/juno',
        rest: 'https://rest.cosmos.directory/juno',
        symbol: 'JUNO',
        denom: "ujuno",
        exponent: 6,
        min_tx_fee: ["625", "0"],
        gas: 80000,
        prefix: "juno"
    },
    {
        name: 'Akash',
        value: "akash",
        rpc: 'https://rpc.cosmos.directory/akash',
        rest: 'https://rest.cosmos.directory/akash',
        symbol: 'AKT',
        denom: "uakt",
        exponent: 6,
        min_tx_fee: ["3000", "120"],
        gas: 120000,
        prefix: "akash"

    },
    {
        name: 'Stargaze',
        value: "stargaze",
        rpc: 'https://rpc.cosmos.directory/stargaze',
        rest: 'https://rest.cosmos.directory/stargaze',
        symbol: 'STARS',
        denom: "ustars",
        exponent: 6,
        min_tx_fee: ["0", "0"],
        gas: 800000,
        prefix: "stars"

    },
    {
        name: 'Chihuahua',
        value: "chihuahua",
        rpc: 'https://rpc.cosmos.directory/chihuahua',
        rest: 'https://rest.cosmos.directory/chihuahua',
        symbol: 'HUAHUA',
        denom: "uhuahua",
        exponent: 6,
        min_tx_fee: ["8000", "8000"],
        gas: 80000,
        prefix: "chihuahua"

    },
    {
        name: 'Secret Network',
        value: "secretnetwork",
        rpc: 'https://rpc.cosmos.directory/secretnetwork',
        rest: 'https://rest.cosmos.directory/secretnetwork',
        hd_path: "m/44'/529'/0'/0/0",
        symbol: 'SCRT',
        denom: "uscrt",
        exponent: 6,
        min_tx_fee: ["4000", "4000"],
        gas: 160000,
        prefix: "secret"
    },
    {
        chain_id: 'crescent-5',
        name: 'Crescent',
        value: "crescent",
        rpc: 'https://rpc.cosmos.directory/crescent',
        rest: 'https://rest.cosmos.directory/crescent',
        symbol: 'CRE',
        denom: "ucre",
        exponent: 6,
        min_tx_fee: ["0", "0"],
        gas: 160000,
        prefix: "cre"
    },
    {
        chain_id: 'evmos_9001-2',
        name: 'Evmos',
        value: "evmos",
        rpc: 'https://rpc.cosmos.directory/evmos',
        rest: 'https://rest.cosmos.directory/evmos',
        hd_path: "m/44'/60'/0'/0/0",
        symbol: 'EVMOS',
        denom: "aevmos",
        exponent: 18,
        min_tx_fee: ["4000000000000000", "0"],
        gas: 200000,
        prefix: "evmos"
    },
];