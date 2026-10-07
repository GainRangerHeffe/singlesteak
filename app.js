// Global variables
let currentAccount = null;
let web3Provider = null;
let stakingPoolFactory = null;
let factoryContract = null;
let isConnected = false;
let readOnlyProvider = null;
let readOnlyFactoryContract = null;
const CHAIN_ID = '0x171'; // PulseChain Mainnet ID in hex
const FACTORY_ADDRESS = '0x474225793869203F436aCEF9CF251Dc137cE02cB';
const STEAK_POOL_ADDRESS = '0xYOUR_STEAK_POOL_ADDRESS'; // Replace with your deployed contract address
const TAX_RECIPIENT_ADDRESS = '0xYOUR_WALLET_ADDRESS'; // Replace with your wallet address

// Pinata configuration
const PINATA_API_KEY = 'YOUR_PINATA_API_KEY'; // Replace with your Pinata API key
const PINATA_SECRET_KEY = 'YOUR_PINATA_SECRET_KEY'; // Replace with your Pinata secret key
const PINATA_GATEWAY = 'https://black-electoral-dormouse-46.mypinata.cloud/ipfs/';

// Constants for calculations
const SECONDS_PER_YEAR = 31536000; // 365 days
const LOW_TVL_THRESHOLD = 1000; // Consider TVL "low" if under this amount

// Global arrays to track intervals for cleanup
let poolCardIntervals = [];
let modalUpdateInterval = null;

const STEAK_POOL_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "_stakingToken", "type": "address"},
            {"internalType": "string", "name": "_tokenName", "type": "string"},
            {"internalType": "string", "name": "_tokenSymbol", "type": "string"},
            {"internalType": "string", "name": "_poolImageUrl", "type": "string"},
            {"internalType": "uint256", "name": "_initialRewardRate", "type": "uint256"},
            {"internalType": "address", "name": "_taxRecipient", "type": "address"}
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "RewardsAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": false, "internalType": "uint256", "name": "newRate", "type": "uint256"}
        ],
        "name": "RewardRateUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "RewardClaimed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "Staked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "Withdrawn",
        "type": "event"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "addRewards",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "claimRewards",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAPY",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getUniqueStakerCount",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "account", "type": "address"}
        ],
        "name": "earned",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "lastUpdateTime",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "poolImageUrl",
        "outputs": [
            {"internalType": "string", "name": "", "type": "string"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "rewardPerToken",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "rewardPerTokenStored",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "rewardRate",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "newRate", "type": "uint256"}
        ],
        "name": "scheduleRewardRateUpdate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "stake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "stakingToken",
        "outputs": [
            {"internalType": "contract IERC20", "name": "", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "tokenName",
        "outputs": [
            {"internalType": "string", "name": "", "type": "string"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "tokenSymbol",
        "outputs": [
            {"internalType": "string", "name": "", "type": "string"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalStaked",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "uniqueStakerCount",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "", "type": "address"}
        ],
        "name": "userRewardPerTokenPaid",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "", "type": "address"}
        ],
        "name": "userStakedAmount",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "", "type": "address"}
        ],
        "name": "rewards",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "taxRecipient",
        "outputs": [
            {"internalType": "address", "name": "", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Contract ABIs (keeping same as original)
const FACTORY_ABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "initialFee",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "initialFeeRecipient",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "newFeeRecipient",
                "type": "address"
            }
        ],
        "name": "FeeRecipientUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "newFee",
                "type": "uint256"
            }
        ],
        "name": "FeeUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "poolAddress",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "stakingToken",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "creator",
                "type": "address"
            }
        ],
        "name": "PoolCreated",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "stakingToken",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "tokenName",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "tokenSymbol",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "poolImageUrl",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "initialRewardRate",
                "type": "uint256"
            }
        ],
        "name": "createPool",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "feeRecipient",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPoolCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "developer",
                "type": "address"
            }
        ],
        "name": "getPoolsByDeveloper",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "poolCreationFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "stakingPools",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newFeeRecipient",
                "type": "address"
            }
        ],
        "name": "updateFeeRecipient",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "newFee",
                "type": "uint256"
            }
        ],
        "name": "updatePoolCreationFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const STAKING_POOL_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "_stakingToken", "type": "address" },
            { "internalType": "string", "name": "_tokenName", "type": "string" },
            { "internalType": "string", "name": "_tokenSymbol", "type": "string" },
            { "internalType": "string", "name": "_poolImageUrl", "type": "string" },
            { "internalType": "uint256", "name": "_initialRewardRate", "type": "uint256" },
            { "internalType": "address", "name": "_owner", "type": "address" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "addRewards", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "applyRewardRateUpdate", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "claimRewards", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "earned", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "exit", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "getAPY", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getUniqueStakerCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "hasStaked", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "lastUpdateTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "pendingRewardRate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "poolImageUrl", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "rewardPerToken", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "rewardPerTokenStored", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "rewardRate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "rewardRateUpdatePending", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "rewardRateUpdateTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "rewards", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "_newRewardRate", "type": "uint256" }], "name": "scheduleRewardRateUpdate", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "stake", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "stakingToken", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "tokenName", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "tokenSymbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "totalStaked", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "uniqueStakerCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "string", "name": "_tokenName", "type": "string" }, { "internalType": "string", "name": "_tokenSymbol", "type": "string" }, { "internalType": "string", "name": "_poolImageUrl", "type": "string" }], "name": "updatePoolInfo", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "userRewardPerTokenPaid", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "userStakedAmount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{ "name": "", "type": "string" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{ "name": "", "type": "string" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "name": "", "type": "uint8" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{ "name": "owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "", "type": "uint256" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{ "name": "spender", "type": "address" }, { "name": "value", "type": "uint256" }],
        "name": "approve",
        "outputs": [{ "name": "", "type": "bool" }],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }],
        "name": "allowance",
        "outputs": [{ "name": "", "type": "uint256" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

// Cache DOM elements
const domCache = {};
function getElement(id) {
    if (!domCache[id]) {
        domCache[id] = document.getElementById(id);
    }
    return domCache[id];
}

// Function to clear all pool card intervals
function clearAllPoolCardIntervals() {
    poolCardIntervals.forEach(intervalId => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    });
    poolCardIntervals = [];
}

// Function to clear modal update interval
function clearModalUpdateInterval() {
    if (modalUpdateInterval) {
        clearInterval(modalUpdateInterval);
        modalUpdateInterval = null;
    }
}

function fixEthersProviderIssues() {
    if (ethers.version && ethers.version.startsWith('6')) {
        console.log("Using ethers.js v6");

        if (!ethers.JsonRpcProvider && ethers.providers && ethers.providers.JsonRpcProvider) {
            ethers.JsonRpcProvider = ethers.providers.JsonRpcProvider;
        }

        if (!ethers.Contract.getInterface && ethers.utils && ethers.utils.Interface) {
            ethers.Contract.getInterface = function (abi) {
                return new ethers.utils.Interface(abi);
            };
        }
    } else {
        console.log("Using ethers.js v5 or earlier");

        if (!ethers.JsonRpcProvider && ethers.providers && ethers.providers.JsonRpcProvider) {
            ethers.JsonRpcProvider = function (url) {
                return new ethers.providers.JsonRpcProvider(url);
            };
        }
    }

    if (!ethers.JsonRpcProvider && !ethers.providers) {
        console.error("Critical error: Can't find JsonRpcProvider in ethers library!");
        showNotification("Error loading blockchain data. Please check console.", "error");
    }
}

async function initializeReadOnlyAccess() {
    try {
        console.log("Initializing read-only access...");

        readOnlyProvider = new ethers.JsonRpcProvider('https://pulsechain-rpc.publicnode.com');

        readOnlyFactoryContract = new ethers.Contract(
            FACTORY_ADDRESS,
            FACTORY_ABI,
            readOnlyProvider
        );

        console.log("Read-only access initialized successfully");

        const count = await readOnlyFactoryContract.getPoolCount();
        console.log(`Read-only access test: Pool count = ${count}`);

        return true;
    } catch (error) {
        console.error("Error initializing read-only access:", error);

        const noPoolsMessage = getElement('no-pools');
        if (noPoolsMessage) {
            noPoolsMessage.innerHTML = `
                <img src="images/steak2.webp" alt="Connection Error" width="200" height="200">
                <h3>Error connecting to PulseChain</h3>
                <p>We couldn't connect to the PulseChain network. Please try again later.</p>
            `;
            noPoolsMessage.style.display = 'block';
        }

        return false;
    }
}

// Fixed image upload functionality with Pinata
let uploadedImageHash = null;

function setupImageUpload() {
    const poolImageInput = getElement('pool-image');
    const imagePreview = getElement('image-preview');
    const uploadStatus = getElement('upload-status');

    if (!poolImageInput) {
        console.warn('Pool image input not found');
        return;
    }

    poolImageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (1MB max)
        if (file.size > 1024 * 1024) {
            showNotification('Image must be under 1MB', 'warning');
            poolImageInput.value = '';
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            if (imagePreview) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Pool preview" style="max-width: 200px; max-height: 200px;">`;
            }
        };
        reader.readAsDataURL(file);

        // Update upload status
        if (uploadStatus) {
            uploadStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading to Pinata...';
        }

        try {
            // Upload to Pinata
            const ipfsHash = await uploadToPinata(file);

            if (ipfsHash) {
                uploadedImageHash = `${PINATA_GATEWAY}${ipfsHash}`;
                if (uploadStatus) {
                    uploadStatus.innerHTML = '<i class="fas fa-check"></i> Uploaded to Pinata';
                }
                console.log('Successfully uploaded to Pinata:', uploadedImageHash);
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading image:', error);

            // Fallback to data URL for small images
            if (file.size < 100000) { // Under 100KB
                try {
                    const dataUrl = await fileToDataURL(file);
                    uploadedImageHash = dataUrl;
                    if (uploadStatus) {
                        uploadStatus.innerHTML = '<i class="fas fa-check"></i> Image ready (data URL)';
                    }
                } catch (dataError) {
                    console.error('Error creating data URL:', dataError);
                    if (uploadStatus) {
                        uploadStatus.innerHTML = '<i class="fas fa-times"></i> Upload failed - using default';
                    }
                    uploadedImageHash = null;
                }
            } else {
                if (uploadStatus) {
                    uploadStatus.innerHTML = '<i class="fas fa-times"></i> Upload failed - using default';
                }
                uploadedImageHash = null;
            }
        }
    });
}

// Upload file to Pinata
async function uploadToPinata(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        // Pinata metadata (optional)
        const metadata = JSON.stringify({
            name: `pool-image-${Date.now()}`,
            keyvalues: {
                platform: 'singlesteak'
            }
        });
        formData.append('pinataMetadata', metadata);

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_KEY
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Pinata upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.IpfsHash;
    } catch (error) {
        console.error('Pinata upload error:', error);
        throw error;
    }
}

// Helper function to convert file to data URL
function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM loaded - beginning initialization");

    fixEthersProviderIssues();

    await initializeReadOnlyAccess();

    const connectWalletBtn = getElement('connect-wallet');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', () => {
            if (!isConnected) {
                showWalletSelectionModal();
            } else {
                disconnectWallet();
            }
        });
    }

    setupWalletModal();
    checkNetworkCompatibility();

    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
    }

    // Create pool form with enhanced calculations
    const createPoolForm = getElement('create-pool-form');
    if (createPoolForm) {
        createPoolForm.addEventListener('submit', handleCreatePool);
    }

    // Setup enhanced pool creation inputs
    setupPoolCreationCalculations();

    // Setup image upload functionality with Pinata
    setupImageUpload();

    const tokenAddressInput = getElement('token-address');
    if (tokenAddressInput) {
        tokenAddressInput.addEventListener('blur', lookupTokenInfo);
    }

    const poolDetailsModal = getElement('pool-details-modal');
    const closeModal = document.querySelector('.close-modal');

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            poolDetailsModal.style.display = 'none';
            // Clear update interval when closing
            clearModalUpdateInterval();
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === poolDetailsModal) {
            poolDetailsModal.style.display = 'none';
            // Clear update interval when closing
            clearModalUpdateInterval();
        }
    });

    setupPoolModalEvents();

    // Check if wallet is connected and ensure proper initialization
    await checkIfWalletIsConnected();

    // Initialize the page after wallet check
    initializePage();
});

// New function to setup pool creation calculations
function setupPoolCreationCalculations() {
    const expectedTvlInput = getElement('expected-tvl');
    const targetApyInput = getElement('target-apy');
    const rewardRateInput = getElement('reward-rate');
    const initialRewardsInput = getElement('initial-rewards');

    const calculateRewardRate = async () => {
        const expectedTvl = parseFloat(expectedTvlInput?.value) || 0;
        const targetApy = parseFloat(targetApyInput?.value) || 0;
        const initialRewards = parseFloat(initialRewardsInput?.value) || 0;

        if (targetApy > 0) {
            // The contract's rewardRate is the total tokens per second paid to the
            // whole pool, shared pro rata. To hit the target APY at the expected TVL:
            // rate = expectedTVL * (targetAPY / 100) / secondsPerYear
            const poolRewardRate = expectedTvl > 0
                ? (expectedTvl * targetApy) / (100 * SECONDS_PER_YEAR)
                : 0;
            if (rewardRateInput) {
                rewardRateInput.value = poolRewardRate > 0 ? poolRewardRate.toFixed(18) : '';

                // Store the calculated rate for form submission
                rewardRateInput.setAttribute('data-rate', poolRewardRate.toString());
            }

            // Update APY preview
            const estimatedApyEl = getElement('estimated-apy');
            if (estimatedApyEl) {
                estimatedApyEl.textContent = `${targetApy}%`;
            }

            // Rewards duration: the pool pays out at the same rate whatever the TVL
            if (initialRewards > 0 && poolRewardRate > 0) {
                const durationSeconds = initialRewards / poolRewardRate;
                const durationDays = durationSeconds / 86400;
                const rewardsDurationEl = getElement('rewards-duration');
                if (rewardsDurationEl) {
                    rewardsDurationEl.textContent = `${durationDays.toFixed(1)} days`;
                }
            } else {
                const rewardsDurationEl = getElement('rewards-duration');
                if (rewardsDurationEl) {
                    rewardsDurationEl.textContent = `0 days`;
                }
            }
        }
    };

    if (expectedTvlInput) {
        expectedTvlInput.addEventListener('input', calculateRewardRate);
    }
    if (targetApyInput) {
        targetApyInput.addEventListener('input', calculateRewardRate);
    }
    if (initialRewardsInput) {
        initialRewardsInput.addEventListener('input', calculateRewardRate);
    }
}

function initializePage() {
    const hash = window.location.hash;
    if (hash && hash !== '#') {
        const targetElement = getElement(hash.substring(1));
        if (targetElement) {
            targetElement.scrollIntoView();
        }
    }

    loadSteakPool(); // Load STEAK pool first
    loadPools();
    setupSearchAndFilters();
    if (web3Provider && factoryContract) {
        loadPoolCreationFee();
    }
}

function checkNetworkCompatibility() {
    if (window.ethereum) {
        window.ethereum.on('chainChanged', async (chainId) => {
            console.log('Network changed to:', chainId);
            
            if (typeof chainId !== 'string' || !chainId.startsWith('0x')) {
                showNotification('Non-EVM network detected. This dApp only works with PulseChain.', 'error');
                disconnectWallet();
                return;
            }
            
            const PULSECHAIN_HEX_ID = '0x171';
            if (chainId !== PULSECHAIN_HEX_ID) {
                showWrongNetworkWarning();
                if (currentAccount) {
                    updateUIForConnectedWalletWrongNetwork();
                }
                return;
            }
            
            // On correct network - remove warning and reconnect
            document.getElementById('network-warning')?.remove();
            
            if (currentAccount) {
                try {
                    await setupContracts();
                    updateUIForConnectedWallet();
                    // Only clear and reload pools when network actually changes
                    clearAllPoolCardIntervals();
                    await loadPools();
                    await loadDeveloperPools();
                    showNotification('Connected to PulseChain successfully!', 'success');
                } catch (error) {
                    console.error('Error reconnecting after network change:', error);
                }
            }
        });

        // Also listen for account changes
        window.ethereum.on('accountsChanged', async (accounts) => {
            if (accounts.length === 0) {
                disconnectWallet();
            } else if (accounts[0] !== currentAccount) {
                currentAccount = accounts[0];
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                
                if (chainId === '0x171') {
                    updateUIForConnectedWallet();
                    clearAllPoolCardIntervals();
                    await loadPools();
                    await loadDeveloperPools();
                } else {
                    updateUIForConnectedWalletWrongNetwork();
                }
            }
        });
    }
}

async function loadPoolCreationFee() {
    try {
        const feeElement = getElement('pool-creation-fee');
        if (!feeElement) return;

        if (!factoryContract) {
            feeElement.textContent = 'Connect wallet to see fee';
            return;
        }

        const poolCreationFee = await factoryContract.poolCreationFee();
        feeElement.textContent = `${ethers.formatEther(poolCreationFee)} PLS`;
    } catch (error) {
        console.error("Error loading pool creation fee:", error);
        const feeElement = getElement('pool-creation-fee');
        if (feeElement) {
            feeElement.textContent = 'Error loading fee';
        }
    }
}


async function connectWallet() {
    if (!window.ethereum) {
        showNotification('Please install MetaMask or another Web3 wallet', 'warning');
        return;
    }

    try {
        // First request accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        currentAccount = accounts[0];

        // Check current network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const PULSECHAIN_HEX_ID = '0x171';

        if (chainId !== PULSECHAIN_HEX_ID) {
            // Try to switch network, but continue even if they decline
            const networkSwitched = await ensurePulseChainNetwork();
            if (!networkSwitched) {
                // User declined switch - show connected but with warning
                updateUIForConnectedWalletWrongNetwork();
                showNotification('Connected to wallet, but please switch to PulseChain to use all features', 'warning');
                return;
            }
        }

        // Remove any existing network warning
        document.getElementById('network-warning')?.remove();

        await setupContracts();
        updateUIForConnectedWallet();

        // Load developer pools after connecting
        setTimeout(async () => {
            await loadDeveloperPools();
        }, 500);

        // REMOVED: Don't reload all pools here since they're already loaded
        // The pools loaded via read-only access will be updated with user data automatically
        
        showNotification('Connected to PulseChain successfully!', 'success');
    } catch (error) {
        console.error("Error connecting wallet:", error);
        if (error.code === 4001) {
            showNotification('Connection rejected by user', 'warning');
        } else {
            showNotification('Failed to connect wallet: ' + (error.message || 'Unknown error'), 'error');
        }
    }
}

async function ensurePulseChainNetwork() {
    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const PULSECHAIN_HEX_ID = '0x171'; // PulseChain mainnet

        if (chainId === PULSECHAIN_HEX_ID) {
            return true; // Already on correct network
        }

        // Try to switch to PulseChain
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: PULSECHAIN_HEX_ID }]
            });
            
            showNotification('Switched to PulseChain network', 'success');
            return true;
        } catch (switchError) {
            // Network doesn't exist in wallet, try to add it
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: PULSECHAIN_HEX_ID,
                            chainName: 'PulseChain',
                            nativeCurrency: {
                                name: 'Pulse',
                                symbol: 'PLS',
                                decimals: 18
                            },
                            rpcUrls: ['https://pulsechain-rpc.publicnode.com'],
                            blockExplorerUrls: ['https://scan.pulsechain.com']
                        }]
                    });
                    
                    showNotification('PulseChain network added and selected', 'success');
                    return true;
                } catch (addError) {
                    console.error('Failed to add PulseChain network:', addError);
                    showNotification('Failed to add PulseChain network. Please add it manually.', 'error');
                    return false;
                }
            } else if (switchError.code === 4001) {
                showNotification('Network switch rejected. Please switch to PulseChain manually to use this app.', 'warning');
                return false;
            } else {
                console.error('Failed to switch network:', switchError);
                showNotification('Failed to switch to PulseChain. Please switch manually.', 'error');
                return false;
            }
        }
    } catch (error) {
        console.error('Error checking/switching network:', error);
        showNotification('Error checking network. Please ensure you\'re on PulseChain.', 'error');
        return false;
    }
}

function showWrongNetworkWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.id = 'network-warning';
    warningDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff9800;
        color: white;
        padding: 1rem;
        text-align: center;
        z-index: 9999;
        font-weight: bold;
    `;
    
    warningDiv.innerHTML = `
        <div>
            ⚠️ Wrong Network Detected - This app requires PulseChain
            <button onclick="switchToPulseChain()" style="margin-left: 10px; background: white; color: #ff9800; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                Switch to PulseChain
            </button>
            <button onclick="document.getElementById('network-warning').remove()" style="margin-left: 5px; background: transparent; color: white; border: 1px solid white; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                Dismiss
            </button>
        </div>
    `;
    
    // Remove existing warning if present
    const existing = document.getElementById('network-warning');
    if (existing) existing.remove();
    
    document.body.insertBefore(warningDiv, document.body.firstChild);
}

// Global function for the switch button
window.switchToPulseChain = async function() {
    const success = await ensurePulseChainNetwork();
    if (success) {
        document.getElementById('network-warning')?.remove();
        // Reconnect after network switch
        await checkIfWalletIsConnected();
    }
};

async function checkIfWalletIsConnected() {
    try {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });

            if (accounts.length > 0) {
                currentAccount = accounts[0];
                
                // Check if on correct network
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                const PULSECHAIN_HEX_ID = '0x171';
                
                if (chainId !== PULSECHAIN_HEX_ID) {
                    // Show warning but still update UI to show wallet is connected
                    showWrongNetworkWarning();
                    updateUIForConnectedWalletWrongNetwork();
                    return;
                }
                
                // Remove any existing network warning
                document.getElementById('network-warning')?.remove();
                
                await setupContracts();
                updateUIForConnectedWallet();

                // Load developer pools when wallet is detected
                setTimeout(async () => {
                    await loadDeveloperPools();
                }, 500);

                // REMOVED: Don't reload pools here either
                // Pools are already loaded by initializePage()
            }
        }
    } catch (error) {
        console.error("Error checking if wallet is connected:", error);
        showNotification('Error connecting to wallet', 'error');
    }
}

function updateUIForConnectedWallet() {
    const connectBtn = getElement('connect-wallet');
    if (connectBtn) {
        connectBtn.innerHTML = `<i class="fas fa-wallet"></i> ${formatAddress(currentAccount)}`;
    }

    isConnected = true;

    const developerDashboard = getElement('dashboard');
    if (developerDashboard) {
        developerDashboard.style.display = 'block';
    }

    loadPoolCreationFee();
}

function updateUIForConnectedWalletWrongNetwork() {
    const connectBtn = getElement('connect-wallet');
    if (connectBtn) {
        connectBtn.innerHTML = `<i class="fas fa-wallet"></i> ${formatAddress(currentAccount)} (Wrong Network)`;
        connectBtn.style.color = '#ff9800';
    }

    isConnected = false; // Keep this false so wallet features are disabled

    // Don't show dashboard or try to load pools on wrong network
    const developerDashboard = getElement('dashboard');
    if (developerDashboard) {
        developerDashboard.style.display = 'none';
    }
}

async function setupContracts() {
    try {
        web3Provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await web3Provider.getSigner();
        factoryContract = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
        console.log("Contracts set up successfully");
    } catch (error) {
        console.error("Error setting up contracts:", error);
        showNotification('Error initializing contracts', 'error');
    }
}

async function loadPools() {
    try {
        console.log("Loading pools...");
        const poolsContainer = getElement('pools-container');
        const noPoolsMessage = getElement('no-pools');

        if (!poolsContainer) return;

        // Clear existing pools and intervals
        clearAllPoolCardIntervals();
        const existingPools = poolsContainer.querySelectorAll('.pool-card');
        existingPools.forEach(pool => pool.remove());

        const contractToUse = factoryContract || readOnlyFactoryContract;

        if (!contractToUse) {
            console.log("No contract available");
            if (noPoolsMessage) {
                noPoolsMessage.style.display = 'block';
                noPoolsMessage.innerHTML = `
                    <img src="images/steak2.webp" alt="Loading pools" width="200" height="200">
                    <h3>Loading staking pools...</h3>
                    <p>Please wait while we connect to PulseChain</p>
                `;
            }
            return;
        }

        console.log("Contract available, getting pool count...");

        const poolCount = await contractToUse.getPoolCount();
        console.log(`Total pool count: ${poolCount}`);

        if (Number(poolCount) === 0) {
            console.log("No pools found");
            if (noPoolsMessage) {
                noPoolsMessage.style.display = 'block';
            }
            updateStatCounters(0, '0', '0');
            return;
        } else {
            console.log(`Found ${poolCount} pools`);
            if (noPoolsMessage) {
                noPoolsMessage.style.display = 'none';
            }
        }

        const poolAddresses = [];
        for (let i = 0; i < poolCount; i++) {
            const address = await contractToUse.stakingPools(i);
            poolAddresses.push(address);
        }

        const poolsData = await Promise.all(poolAddresses.map(async (address, index) => {
            console.log(`Fetching data for pool ${index + 1}/${poolAddresses.length}: ${address}`);
            return await getPoolData(address);
        }));

        console.log("All pool data retrieved:", poolsData);

        let totalTVL = 0;
        let totalAPY = 0;
        let validAPYCount = 0;

        poolsData.forEach(pool => {
            totalTVL += parseFloat(pool.tvl);
            if (parseFloat(pool.tvl) > 0) {
                totalAPY += parseFloat(pool.apy);
                validAPYCount++;
            }
        });

        const avgAPY = validAPYCount > 0 ? (totalAPY / validAPYCount).toFixed(2) : '0';

        updateStatCounters(poolsData.length, formatTVL(totalTVL), avgAPY);

        poolsData.sort((a, b) => parseFloat(b.apy) - parseFloat(a.apy));

        poolsData.forEach(pool => {
            const poolCard = createPoolCard(pool);
            poolsContainer.appendChild(poolCard);
        });

        console.log("Pools loaded successfully");

    } catch (error) {
        console.error("Error loading pools:", error);
        showNotification('Error loading staking pools', 'error');

        const noPoolsMessage = getElement('no-pools');
        if (noPoolsMessage) {
            noPoolsMessage.innerHTML = `
                <img src="images/steak2.webp" alt="Error" width="200" height="200">
                <h3>Error loading pools</h3>
                <p>${error.message || 'An unexpected error occurred'}</p>
            `;
            noPoolsMessage.style.display = 'block';
        }
    }
}

async function loadSteakPool() {
    try {
        showLoading('Loading STEAK pool...');

        // Placeholder data for testing
        const placeholderData = {
            address: STEAK_POOL_ADDRESS,
            tokenName: 'STEAK Pool (Coming soon)',
            tokenSymbol: '$STEAK',
            apy: '0%',
            stakerCount: 0,
            tvl: '0 STEAK',
            userStaked: '0',
            userRewards: '0'
        };

        // Update section elements
        const section = document.getElementById('steak-pool');
        section.querySelector('.pool-name').textContent = placeholderData.tokenName;
        section.querySelector('.pool-symbol').textContent = placeholderData.tokenSymbol;
        section.querySelector('.apy-value').textContent = placeholderData.apy;
        section.querySelector('.staker-count').textContent = placeholderData.stakerCount;
        section.querySelector('.tvl-value').textContent = placeholderData.tvl;
        section.querySelector('.user-staked-value').textContent = placeholderData.userStaked;
        section.querySelector('.user-rewards-value').textContent = placeholderData.userRewards;
        

        // Add event listeners for actions
        const depositBtn = section.querySelector('.deposit-btn');
        const withdrawBtn = section.querySelector('.withdraw-btn');
        const claimBtn = section.querySelector('.claim-btn');
        depositBtn.addEventListener('click', () => handleDeposit(section));
        withdrawBtn.addEventListener('click', () => handleWithdraw(section));
        claimBtn.addEventListener('click', () => handleClaim(section));

        console.log('Placeholder STEAK pool section updated');
        hideLoading();
    } catch (error) {
        console.error('Error loading STEAK pool:', error);
        showNotification('Failed to load STEAK pool', 'error');
        hideLoading();
    }
}

async function getPoolData(poolAddress) {
    try {
        console.log(`Getting data for pool: ${poolAddress}`);

        const provider = web3Provider || readOnlyProvider;
        if (!provider) {
            throw new Error("No provider available");
        }

        let poolContract;
        let signer = null;
        const isSteakPool = poolAddress.toLowerCase() === STEAK_POOL_ADDRESS.toLowerCase();
        const abi = isSteakPool ? STEAK_POOL_ABI : STAKING_POOL_ABI;

        try {
            if (web3Provider) {
                signer = await web3Provider.getSigner();
                poolContract = new ethers.Contract(poolAddress, abi, signer);
            } else {
                poolContract = new ethers.Contract(poolAddress, abi, provider);
            }
        } catch (error) {
            console.error(`Error creating contract instance for ${poolAddress}:`, error);
            throw error;
        }

        console.log(`Fetching basic pool data for ${poolAddress}...`);

        try {
            const [stakingTokenAddr, tokenName, tokenSymbol, poolImageUrl, totalStaked, rewardRate, apy] = await Promise.all([
                poolContract.stakingToken(),
                poolContract.tokenName(),
                poolContract.tokenSymbol(),
                poolContract.poolImageUrl(),
                poolContract.totalStaked(),
                poolContract.rewardRate(),
                poolContract.getAPY()
            ]);

            console.log(`Getting token details for ${stakingTokenAddr}...`);
            const tokenContract = new ethers.Contract(stakingTokenAddr, ERC20_ABI, signer || provider);

            let decimals;
            try {
                decimals = await tokenContract.decimals();
                console.log(`Token decimals: ${decimals}`);
            } catch (error) {
                console.error(`Error getting token decimals for ${stakingTokenAddr}, defaulting to 18:`, error);
                decimals = 18;
            }

            let displayAPY = Number(apy) / 1e18;
            if (displayAPY === 0 && Number(rewardRate) > 0) {
                const theoreticalTVL = ethers.parseUnits('1000', decimals);
                const yearlyRewards = Number(rewardRate) * 365 * 24 * 60 * 60;
                const yearlyRewardsFormatted = Number(ethers.formatUnits(BigInt(Math.floor(yearlyRewards)), decimals));
                const theoreticalAPY = (yearlyRewardsFormatted / 1000) * 100;
                displayAPY = theoreticalAPY;
                console.log(`Calculated theoretical APY for ${tokenSymbol}: ${theoreticalAPY}%`);
            }

            let stakerCount = 0;
            try {
                if (totalStaked > 0n) {
                    stakerCount = await poolContract.getUniqueStakerCount();
                    console.log(`Number of active stakers: ${stakerCount}`);
                }
            } catch (error) {
                console.log(`Pool doesn't support staker counting for ${poolAddress}:`, error);
            }

            const tvl = ethers.formatUnits(totalStaked, decimals);
            const tvlNumeric = parseFloat(tvl);
            if (stakerCount === 0 && tvlNumeric > 0) {
                stakerCount = 1;
            }

            const isLowTVL = tvlNumeric < LOW_TVL_THRESHOLD;
            console.log(`Formatted TVL: ${tvl}, Is low TVL: ${isLowTVL}`);

            let userStaked = '0';
            let userRewards = '0';
            let isOwner = false;
            let rewardBalance = '0';

            try {
                const providerToUse = signer || readOnlyProvider;
                if (providerToUse) {
                    const tokenContract = new ethers.Contract(stakingTokenAddr, ERC20_ABI, providerToUse);
                    // Stakes and rewards are the same token held in one balance,
                    // so the rewards available are whatever is not staked principal.
                    const poolBalanceRaw = await tokenContract.balanceOf(poolAddress);
                    const poolRewardBalanceRaw = poolBalanceRaw > totalStaked ? poolBalanceRaw - totalStaked : 0n;
                    rewardBalance = ethers.formatUnits(poolRewardBalanceRaw, decimals);
                    console.log(`Pool ${poolAddress} reward balance: ${rewardBalance} ${tokenSymbol}`);
                }
            } catch (error) {
                console.log(`Error getting reward balance for ${poolAddress}:`, error);
            }

            if (currentAccount && signer) {
                try {
                    console.log(`Getting user-specific data for ${currentAccount}...`);
                    const [stakedAmount, rewards, poolOwner] = await Promise.all([
                        poolContract.userStakedAmount(currentAccount),
                        poolContract.earned(currentAccount),
                        poolContract.owner()
                    ]);

                    userStaked = ethers.formatUnits(stakedAmount, decimals);
                    userRewards = ethers.formatUnits(rewards, decimals);
                    isOwner = currentAccount && poolOwner.toLowerCase() === currentAccount.toLowerCase();
                    console.log(`Pool: ${poolAddress}, Owner: ${poolOwner}, Is Owner: ${isOwner}`);
                } catch (error) {
                    console.error(`Error fetching user-specific data for ${currentAccount}:`, error);
                }
            }

            console.log(`Pool data retrieved successfully for ${poolAddress}`);

            return {
                address: poolAddress,
                name: tokenName,
                symbol: tokenSymbol,
                imageUrl: poolImageUrl || generateCashTagImage(tokenSymbol),
                stakingToken: stakingTokenAddr,
                tvl,
                tvlNumeric,
                isLowTVL,
                rewardRate: ethers.formatUnits(rewardRate, decimals),
                apy: displayAPY.toFixed(2),
                userStaked,
                userRewards,
                tokenDecimals: decimals,
                isOwner,
                stakerCount: Number(stakerCount),
                rewardBalance
            };

        } catch (error) {
            console.error(`Error getting basic pool data for ${poolAddress}:`, error);
            throw error;
        }

    } catch (error) {
        console.error(`Error fetching pool data for ${poolAddress}:`, error);
        return {
            address: poolAddress,
            name: 'Error Loading',
            symbol: 'ERROR',
            imageUrl: 'images/steak2.webp',
            stakingToken: '0x0',
            tvl: '0',
            tvlNumeric: 0,
            isLowTVL: false,
            rewardRate: '0',
            apy: '0',
            userStaked: '0',
            userRewards: '0',
            tokenDecimals: 18,
            isOwner: false,
            stakerCount: 0,
            rewardBalance: '0'
        };
    }
}

async function getDeveloperPoolData(poolAddress) {
    try {
        const basicData = await getPoolData(poolAddress);
        
        if (!currentAccount || !web3Provider) {
            return basicData;
        }
        
        const signer = await web3Provider.getSigner();
        const poolContract = new ethers.Contract(poolAddress, STAKING_POOL_ABI, signer);
        const tokenContract = new ethers.Contract(basicData.stakingToken, ERC20_ABI, signer);
        
        // Reward tokens available: the pool's token balance minus staked principal
        const [poolTokenBalance, poolTotalStaked] = await Promise.all([
            tokenContract.balanceOf(poolAddress),
            poolContract.totalStaked()
        ]);
        const poolRewardBalance = poolTokenBalance > poolTotalStaked ? poolTokenBalance - poolTotalStaked : 0n;
        const rewardBalanceFormatted = ethers.formatUnits(poolRewardBalance, basicData.tokenDecimals);
        
        // Calculate reward duration
        const rewardRate = parseFloat(basicData.rewardRate);
        const rewardBalance = parseFloat(rewardBalanceFormatted);
        
        let rewardDurationDays = 0;
        let rewardStatus = 'No rewards';
        
        if (rewardRate > 0 && rewardBalance > 0) {
            const durationSeconds = rewardBalance / rewardRate;
            rewardDurationDays = durationSeconds / 86400; // Convert to days
            
            if (rewardDurationDays < 1) {
                rewardStatus = 'Critical - Less than 1 day';
            } else if (rewardDurationDays < 7) {
                rewardStatus = `${rewardDurationDays.toFixed(1)} days left`;
            } else {
                rewardStatus = `${rewardDurationDays.toFixed(0)} days funded`;
            }
        } else if (rewardBalance > 0 && rewardRate === 0) {
            rewardStatus = 'Rewards loaded, rate = 0';
        }
        
        // Get additional stats
        let pendingRateUpdate = null;
        try {
            const isPending = await poolContract.rewardRateUpdatePending();
            if (isPending) {
                const pendingRate = await poolContract.pendingRewardRate();
                const updateTime = await poolContract.rewardRateUpdateTime();
                pendingRateUpdate = {
                    rate: ethers.formatUnits(pendingRate, basicData.tokenDecimals),
                    time: new Date(Number(updateTime) * 1000)
                };
            }
        } catch (error) {
            console.log('Error getting pending rate update:', error);
        }
        
        return {
            ...basicData,
            rewardBalance: rewardBalanceFormatted,
            rewardBalanceRaw: poolRewardBalance,
            rewardDurationDays,
            rewardStatus,
            pendingRateUpdate
        };
        
    } catch (error) {
        console.error('Error getting developer pool data:', error);
        return await getPoolData(poolAddress);
    }
}


function createPoolCard(poolData) {
    const template = document.getElementById('pool-card-template');
    const poolCard = document.importNode(template.content, true).querySelector('.pool-card');

    poolCard.querySelector('.pool-logo').src = poolData.imageUrl || 'images/steak2.webp';

    poolCard.querySelector('.pool-name').textContent = poolData.name;
    poolCard.querySelector('.pool-symbol').textContent = poolData.symbol;

    // Format APY with better handling for large numbers
    const apy = parseFloat(poolData.apy);
    const tvlValue = parseFloat(poolData.tvl); // SINGLE DECLARATION HERE
    const rewardRate = parseFloat(poolData.rewardRate); // DECLARE rewardRate HERE TOO
    const apyElement = poolCard.querySelector('.apy-value');

    if (apy > 999999) {
        apyElement.textContent = '999999%+';
        apyElement.style.fontSize = '0.9em';
    } else if (tvlValue === 0 && apy > 0) {
        // Show it's theoretical when no one has staked yet
        apyElement.innerHTML = `${poolData.apy}%<span style="font-size: 0.7em; color: #ff9800;">*</span>`;
        apyElement.style.fontSize = '';
    } else {
        apyElement.textContent = `${poolData.apy}%`;
        apyElement.style.fontSize = '';
    }

    // Add theoretical APY note
    if (tvlValue === 0 && apy > 0) {
        const apyNote = poolCard.querySelector('.apy-note');
        if (apyNote) {
            apyNote.textContent = '*Theoretical APY';
            apyNote.style.display = 'block';
        }
    }

    // Show pool fund status (rewards available vs staked)
    // REMOVED DUPLICATE DECLARATIONS - using vars from above
    const tvlElement = poolCard.querySelector('.tvl-value');

    if (tvlValue === 0 && rewardRate > 0) {
        tvlElement.innerHTML = `<span style="color: #ff9800; font-size: 0.85em;">Funded<br>No Stakers</span>`;
    } else {
        tvlElement.textContent = `${tvlValue.toFixed(2)} ${poolData.symbol}`;
    }

    // Show APY warning if low TVL
    const apyWarning = poolCard.querySelector('.apy-warning');
    if (poolData.isLowTVL && parseFloat(poolData.tvl) > 0) {
        apyWarning.style.display = 'block';
    } else {
        apyWarning.style.display = 'none';
    }

    // Update staker count - only show active stakers
    poolCard.querySelector('.staker-count').textContent = poolData.stakerCount || 0;

    const userStakedValue = poolCard.querySelector('.user-staked-value');
    const userRewardsValue = poolCard.querySelector('.user-rewards-value');

    if (isConnected) {
        userStakedValue.textContent = `${parseFloat(poolData.userStaked).toFixed(4)} ${poolData.symbol}`;
        userRewardsValue.textContent = `${parseFloat(poolData.userRewards).toFixed(4)} ${poolData.symbol}`;
    } else {
        userStakedValue.textContent = "Connect wallet";
        userRewardsValue.textContent = "Connect wallet";
    }

    const viewBtn = poolCard.querySelector('.view-btn');
    viewBtn.addEventListener('click', () => {
        openPoolDetails(poolData.address);
    });

    poolCard.setAttribute('data-address', poolData.address);
    poolCard.setAttribute('data-tvl', poolData.tvl);
    poolCard.setAttribute('data-apy', poolData.apy);

    // FIXED: Reduced update frequency and better interval management
    const updateInterval = setInterval(async () => {
        try {
            const updatedData = await getPoolData(poolData.address);

            // Update dynamic values
            const updatedApy = parseFloat(updatedData.apy);
            const updatedTvl = parseFloat(updatedData.tvl); // USE DIFFERENT NAME
            const updatedRewardRate = parseFloat(updatedData.rewardRate);
            const rewardBalance = parseFloat(updatedData.rewardBalance || 0);
            
            const apyElement = poolCard.querySelector('.apy-value');
            if (updatedApy > 999999) {
                apyElement.textContent = '999999%+';
                apyElement.style.fontSize = '0.9em';
            } else if (updatedTvl === 0 && updatedApy > 0) {
                apyElement.innerHTML = `${updatedData.apy}%<span style="font-size: 0.7em; color: #ff9800;">*</span>`;
                apyElement.style.fontSize = '';
            } else {
                apyElement.textContent = `${updatedData.apy}%`;
                apyElement.style.fontSize = '';
            }

            const tvlElement = poolCard.querySelector('.tvl-value');

            console.log(`Pool ${poolData.symbol}: TVL=${updatedTvl}, Rate=${updatedRewardRate}, Rewards=${rewardBalance}`);

            if (updatedTvl === 0 && updatedRewardRate > 0 && rewardBalance > 0) {
                tvlElement.innerHTML = `<span style="color: #ff9800; font-size: 0.85em;">Funded<br>No Stakers</span>`;
                console.log(`${poolData.symbol}: Showing as funded with no stakers`);
            } else if (updatedTvl === 0 && updatedRewardRate > 0 && rewardBalance === 0) {
                tvlElement.innerHTML = `<span style="color: #666; font-size: 0.85em;">Rate Set<br>No Rewards</span>`;
                console.log(`${poolData.symbol}: Showing as rate set but no rewards`);
            } else if (updatedTvl === 0) {
                tvlElement.innerHTML = `<span style="color: #666; font-size: 0.85em;">No Stakes</span>`;
                console.log(`${poolData.symbol}: Showing as no stakes`);
            } else {
                tvlElement.textContent = `${updatedTvl.toFixed(2)} ${poolData.symbol}`;
                console.log(`${poolData.symbol}: Showing TVL normally`);
            }

            poolCard.querySelector('.staker-count').textContent = updatedData.stakerCount || 0;

            // Update APY warning
            if (updatedData.isLowTVL && parseFloat(updatedData.tvl) > 0) {
                apyWarning.style.display = 'block';
            } else {
                apyWarning.style.display = 'none';
            }

            if (isConnected) {
                poolCard.querySelector('.user-staked-value').textContent =
                    `${parseFloat(updatedData.userStaked).toFixed(4)} ${updatedData.symbol}`;
                poolCard.querySelector('.user-rewards-value').textContent =
                    `${parseFloat(updatedData.userRewards).toFixed(4)} ${updatedData.symbol}`;
            }
        } catch (error) {
            console.error('Error updating pool card:', error);
        }
    }, 60000); // Update every 60 seconds

    // Track the interval for cleanup
    poolCardIntervals.push(updateInterval);

    // ADD THIS LINE before return:
    addPoolHealthIndicator(poolCard, poolData);

    return poolCard;
}

function createSteakPoolCard(poolData) {
    const template = document.getElementById('steak-pool-card-template') || document.getElementById('pool-card-template');
    const poolCard = document.importNode(template.content, true).querySelector('.pool-card');

    poolCard.classList.add('steak-pool-card');
    poolCard.querySelector('.pool-logo').src = poolData.imageUrl || 'images/steak2.webp';
    poolCard.querySelector('.pool-name').textContent = `${poolData.name} (Official STEAK Pool)`;
    poolCard.querySelector('.pool-symbol').textContent = poolData.symbol;

    const apyElement = poolCard.querySelector('.apy-value');
    const apy = parseFloat(poolData.apy);
    if (apy > 999999) {
        apyElement.textContent = '999999%+';
        apyElement.style.fontSize = '0.9em';
    } else if (poolData.tvlNumeric === 0 && apy > 0) {
        apyElement.innerHTML = `${poolData.apy}%<span style="font-size: 0.7em; color: #ff9800;">*</span>`;
    } else {
        apyElement.textContent = `${poolData.apy}%`;
    }

    const tvlElement = poolCard.querySelector('.tvl-value');
    if (poolData.tvlNumeric === 0 && parseFloat(poolData.rewardRate) > 0 && parseFloat(poolData.rewardBalance) > 0) {
        tvlElement.innerHTML = `<span style="color: #ff9800; font-size: 0.85em;">Funded<br>No Stakers</span>`;
    } else if (poolData.tvlNumeric === 0 && parseFloat(poolData.rewardRate) > 0 && parseFloat(poolData.rewardBalance) === 0) {
        tvlElement.innerHTML = `<span style="color: #666; font-size: 0.85em;">Rate Set<br>No Rewards</span>`;
    } else if (poolData.tvlNumeric === 0) {
        tvlElement.innerHTML = `<span style="color: #666; font-size: 0.85em;">No Stakes</span>`;
    } else {
        tvlElement.textContent = `${poolData.tvlNumeric.toFixed(2)} ${poolData.symbol}`;
    }

    poolCard.querySelector('.staker-count').textContent = poolData.stakerCount || 0;

    const apyWarning = poolCard.querySelector('.apy-warning');
    if (apyWarning) {
        apyWarning.style.display = poolData.isLowTVL && poolData.tvlNumeric > 0 ? 'block' : 'none';
    }

    if (isConnected) {
        poolCard.querySelector('.user-staked-value').textContent = `${parseFloat(poolData.userStaked).toFixed(4)} ${poolData.symbol}`;
        poolCard.querySelector('.user-rewards-value').textContent = `${parseFloat(poolData.userRewards).toFixed(4)} ${poolData.symbol}`;
    }

    // Add tax information
    const taxInfo = document.createElement('div');
    taxInfo.className = 'tax-info';
    taxInfo.style.cssText = 'font-size: 0.8em; color: #ff9800; margin-top: 8px;';
    taxInfo.textContent = '1% tax on deposits (reinvested) and withdrawals (to project wallet)';
    poolCard.appendChild(taxInfo);

    poolCard.addEventListener('click', () => openPoolDetails(poolData.address));
    addPoolHealthIndicator(poolCard, poolData);

    const updateInterval = setInterval(async () => {
        try {
            if (!document.contains(poolCard)) {
                clearInterval(updateInterval);
                return;
            }
            const updatedData = await getPoolData(STEAK_POOL_ADDRESS);
            poolCard.querySelector('.apy-value').textContent = updatedData.apy > 999999 ? '999999%+' : `${updatedData.apy}%`;
            poolCard.querySelector('.tvl-value').textContent = updatedData.tvlNumeric === 0 ? 'No Stakes' : `${updatedData.tvlNumeric.toFixed(2)} ${updatedData.symbol}`;
            poolCard.querySelector('.staker-count').textContent = updatedData.stakerCount || 0;
            if (isConnected) {
                poolCard.querySelector('.user-staked-value').textContent = `${parseFloat(updatedData.userStaked).toFixed(4)} ${updatedData.symbol}`;
                poolCard.querySelector('.user-rewards-value').textContent = `${parseFloat(updatedData.userRewards).toFixed(4)} ${updatedData.symbol}`;
            }
        } catch (error) {
            console.error('Error updating STEAK pool card:', error);
        }
    }, 60000);

    poolCardIntervals.push(updateInterval);
    return poolCard;
}

function createDeveloperPoolCard(poolData) {
    const devCard = document.createElement('div');
    devCard.className = 'dev-pool-card';
    
    // Determine status color
    let statusColor = '#28a745'; // green
    if (poolData.rewardDurationDays < 1 && poolData.rewardDurationDays > 0) {
        statusColor = '#dc3545'; // red
    } else if (poolData.rewardDurationDays < 7 && poolData.rewardDurationDays > 0) {
        statusColor = '#ff9800'; // orange
    }
    
    devCard.innerHTML = `
        <div class="dev-pool-header">
            <div class="dev-pool-basic-info">
                <img src="${poolData.imageUrl || 'images/steak2.webp'}" alt="Token Logo" width="48" height="48" class="dev-pool-logo">
                <div class="dev-pool-info">
                    <h3 class="dev-pool-name">${poolData.name}</h3>
                    <p class="dev-pool-symbol">${poolData.symbol}</p>
                    <p class="dev-pool-address" onclick="copyToClipboard('${poolData.address}')" style="cursor: pointer; color: #007bff;" title="Click to copy full address">${formatAddress(poolData.address)} <i class="fas fa-copy"></i></p>
                </div>
            </div>
            <div class="dev-pool-status" style="color: ${statusColor};">
                <span class="status-indicator" style="background-color: ${statusColor};"></span>
                ${poolData.rewardStatus}
            </div>
        </div>
        
        <div class="dev-pool-analytics">
            <div class="dev-analytics-grid">
                <div class="dev-stat">
                    <label>Current APY</label>
                    <value class="dev-apy">${poolData.apy}%</value>
                </div>
                <div class="dev-stat">
                    <label>Total Staked</label>
                    <value class="dev-tvl">${parseFloat(poolData.tvl).toFixed(2)} ${poolData.symbol}</value>
                </div>
                <div class="dev-stat">
                    <label>Active Stakers</label>
                    <value class="dev-stakers">${poolData.stakerCount || 0}</value>
                </div>
                <div class="dev-stat">
                    <label>Reward Rate</label>
                    <value class="dev-rate">${parseFloat(poolData.rewardRate).toFixed(8)}/sec</value>
                </div>
                <div class="dev-stat">
                    <label>Rewards Available</label>
                    <value class="reward-balance">${parseFloat(poolData.rewardBalance || 0).toFixed(2)} ${poolData.symbol}</value>
                </div>
                <div class="dev-stat">
                    <label>Duration Left</label>
                    <value class="dev-duration">${poolData.rewardDurationDays > 0 ? poolData.rewardDurationDays.toFixed(1) + ' days' : 'N/A'}</value>
                </div>
            </div>
        </div>
        
        ${poolData.pendingRateUpdate ? `
            <div class="dev-pending-update">
                <i class="fas fa-clock"></i>
                <span>Rate update pending: ${parseFloat(poolData.pendingRateUpdate.rate).toFixed(8)}/sec</span>
                <small>Effective: ${poolData.pendingRateUpdate.time.toLocaleDateString()}</small>
            </div>
        ` : ''}
        
        <div class="dev-pool-actions">
            <button class="btn dev-manage-btn" onclick="quickManagePool('${poolData.address}')">
                <i class="fas fa-cogs"></i> Manage Pool
            </button>
            <button class="btn dev-add-rewards-btn" onclick="quickAddRewards('${poolData.address}')">
                <i class="fas fa-plus"></i> Add Rewards
            </button>
        </div>
    `;
    
    devCard.setAttribute('data-address', poolData.address);
    
    // Set up update interval for developer card with null checks
    const updateInterval = setInterval(async () => {
        try {
            // Check if card still exists in DOM
            if (!document.contains(devCard)) {
                clearInterval(updateInterval);
                return;
            }
            
            const updatedData = await getDeveloperPoolData(poolData.address);
            
            // Update dynamic values with null checks
            const statusEl = devCard.querySelector('.dev-pool-status');
            const apyEl = devCard.querySelector('.dev-apy');
            const tvlEl = devCard.querySelector('.dev-tvl');
            const stakersEl = devCard.querySelector('.dev-stakers');
            const rewardBalanceEl = devCard.querySelector('.reward-balance');
            const durationEl = devCard.querySelector('.dev-duration');
            const statusIndicatorEl = devCard.querySelector('.status-indicator');
            
            if (statusEl) statusEl.textContent = updatedData.rewardStatus;
            if (apyEl) apyEl.textContent = `${updatedData.apy}%`;
            if (tvlEl) tvlEl.textContent = `${parseFloat(updatedData.tvl).toFixed(2)} ${updatedData.symbol}`;
            if (stakersEl) stakersEl.textContent = updatedData.stakerCount || 0;
            if (rewardBalanceEl) rewardBalanceEl.textContent = `${parseFloat(updatedData.rewardBalance || 0).toFixed(2)} ${updatedData.symbol}`;
            if (durationEl) durationEl.textContent = updatedData.rewardDurationDays > 0 ? updatedData.rewardDurationDays.toFixed(1) + ' days' : 'N/A';
            
            // Update status color with null checks
            let statusColor = '#28a745';
            if (updatedData.rewardDurationDays < 1 && updatedData.rewardDurationDays > 0) {
                statusColor = '#dc3545';
            } else if (updatedData.rewardDurationDays < 7 && updatedData.rewardDurationDays > 0) {
                statusColor = '#ff9800';
            }
            
            if (statusEl) statusEl.style.color = statusColor;
            if (statusIndicatorEl) statusIndicatorEl.style.backgroundColor = statusColor;
            
        } catch (error) {
            console.error('Error updating developer pool card:', error);
            // Clear interval if there are persistent errors
            clearInterval(updateInterval);
        }
    }, 30000); // Update every 30 seconds
    
    poolCardIntervals.push(updateInterval);
    
    return devCard;
}

async function quickAddRewards(poolAddress) {
    // Create a simple custom modal for quick add rewards
    const modal = document.createElement('div');
    modal.className = 'quick-rewards-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const poolData = await getPoolData(poolAddress);
    
    modal.innerHTML = `
        <div style="background: #2d2d2d; border-radius: 12px; padding: 2rem; max-width: 400px; width: 90%;">
            <h3 style="color: white; margin-bottom: 1rem;">Add Rewards to ${poolData.symbol}</h3>
            <input type="number" id="quick-reward-amount" placeholder="Amount" style="width: 100%; padding: 0.75rem; margin-bottom: 1rem; border-radius: 6px; border: 1px solid #444; background: #1a1a1a; color: white;">
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="this.closest('.quick-rewards-modal').remove()" style="flex: 1; padding: 0.75rem; background: #666; border: none; border-radius: 6px; color: white; cursor: pointer;">Cancel</button>
                <button onclick="executeQuickAddRewards('${poolAddress}')" style="flex: 1; padding: 0.75rem; background: #28a745; border: none; border-radius: 6px; color: white; cursor: pointer;">Add Rewards</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus on input
    setTimeout(() => {
        const input = document.getElementById('quick-reward-amount');
        if (input) input.focus();
    }, 100);
}

async function executeQuickAddRewards(poolAddress) {
    const amount = document.getElementById('quick-reward-amount').value;
    const modal = document.querySelector('.quick-rewards-modal');
    
    if (amount && parseFloat(amount) > 0) {
        modal.remove();
        await addRewards(poolAddress, amount);
    } else {
        showNotification('Please enter a valid amount', 'warning');
    }
}

async function quickManagePool(poolAddress) {
    // Create a modal for managing pool reward rate
    const modal = document.createElement('div');
    modal.className = 'quick-manage-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const poolData = await getPoolData(poolAddress);
    
    modal.innerHTML = `
        <div style="background: #2d2d2d; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%;">
            <h3 style="color: white; margin-bottom: 1.5rem;">Manage ${poolData.symbol} Pool</h3>
            
            <div style="margin-bottom: 1rem;">
                <label style="color: #ccc; display: block; margin-bottom: 0.5rem;">Current Reward Rate</label>
                <div style="color: white; background: #1a1a1a; padding: 0.75rem; border-radius: 6px; border: 1px solid #444;">
                    ${parseFloat(poolData.rewardRate).toFixed(8)} ${poolData.symbol}/sec
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <label style="color: #ccc; display: block; margin-bottom: 0.5rem;">New Reward Rate (${poolData.symbol}/sec)</label>
                <input type="number" id="quick-new-rate" placeholder="0.000001" step="0.000000001" 
                       style="width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid #444; background: #1a1a1a; color: white;">
            </div>
            
            <div style="background: #1a1a1a; border: 1px solid #444; border-radius: 6px; padding: 1rem; margin-bottom: 1rem;">
                <p style="color: #ff9800; margin: 0; font-size: 0.9rem;">
                    <i class="fas fa-clock"></i> Rate changes have a 24-hour delay for security
                </p>
            </div>
            
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="this.closest('.quick-manage-modal').remove()" 
                        style="flex: 1; padding: 0.75rem; background: #666; border: none; border-radius: 6px; color: white; cursor: pointer;">
                    Cancel
                </button>
                <button onclick="executeQuickRateUpdate('${poolAddress}')" 
                        style="flex: 1; padding: 0.75rem; background: #007bff; border: none; border-radius: 6px; color: white; cursor: pointer;">
                    Schedule Update
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus on input
    setTimeout(() => {
        const input = document.getElementById('quick-new-rate');
        if (input) input.focus();
    }, 100);
}

async function executeQuickRateUpdate(poolAddress) {
    const newRate = document.getElementById('quick-new-rate').value;
    const modal = document.querySelector('.quick-manage-modal');
    
    if (newRate && parseFloat(newRate) >= 0) {
        modal.remove();
        await scheduleRateUpdate(poolAddress, newRate);
        // Refresh developer pools after update
        setTimeout(async () => {
            await loadDeveloperPools();
        }, 1000);
    } else {
        showNotification('Please enter a valid rate (0 or higher)', 'warning');
    }
}

function setupSearchAndFilters() {
    console.log("Setting up search and filters...");

    const searchInput = getElement('pool-search');
    const sortSelect = getElement('sort-by');

    if (!searchInput || !sortSelect) {
        console.error("Search or sort elements not found");
        return;
    }

    searchInput.addEventListener('input', function () {
        filterAndSortPools();
    });

    sortSelect.addEventListener('change', function () {
        filterAndSortPools();
    });

    console.log("Search and filters set up successfully");
}

function filterAndSortPools() {
    console.log("Filtering and sorting pools...");

    const searchInput = getElement('pool-search');
    const sortSelect = getElement('sort-by');
    const poolCards = document.querySelectorAll('.pool-card');

    if (!searchInput || !sortSelect || !poolCards.length) {
        console.error("Required elements for filtering not found");
        return;
    }

    const searchTerm = searchInput.value.toLowerCase().trim();
    const sortOption = sortSelect.value;

    console.log(`Search term: "${searchTerm}", Sort option: ${sortOption}`);

    poolCards.forEach(card => {
        const poolName = card.querySelector('.pool-name')?.textContent.toLowerCase() || '';
        const poolSymbol = card.querySelector('.pool-symbol')?.textContent.toLowerCase() || '';

        if (poolName.includes(searchTerm) || poolSymbol.includes(searchTerm) || searchTerm === '') {
            card.classList.remove('search-hidden');
        } else {
            card.classList.add('search-hidden');
        }
    });

    const visibleCards = Array.from(poolCards).filter(card => !card.classList.contains('search-hidden'));

    const sortedCards = [...visibleCards];

    sortedCards.sort((a, b) => {
        const aAPY = parseFloat(a.querySelector('.apy-value')?.textContent || '0');
        const bAPY = parseFloat(b.querySelector('.apy-value')?.textContent || '0');
        const aTVL = parseFloat(a.querySelector('.tvl-value')?.textContent || '0');
        const bTVL = parseFloat(b.querySelector('.tvl-value')?.textContent || '0');

        switch (sortOption) {
            case 'apy-high':
                return bAPY - aAPY;
            case 'apy-low':
                return aAPY - bAPY;
            case 'tvl-high':
                return bTVL - aTVL;
            case 'tvl-low':
                return aTVL - bTVL;
            case 'newest':
                return 0;
            default:
                return 0;
        }
    });

    const container = getElement('pools-container');

    if (container) {
        sortedCards.forEach(card => {
            container.appendChild(card);
        });
    }

    const noPoolsMessage = getElement('no-pools');
    if (noPoolsMessage) {
        if (visibleCards.length === 0 && searchTerm !== '') {
            noPoolsMessage.innerHTML = `
                <img src="images/steak2.webp" alt="No results" width="200" height="200">
                <h3>No matching pools found</h3>
                <p>Try a different search term</p>
            `;
            noPoolsMessage.style.display = 'block';
        } else if (visibleCards.length === 0) {
            noPoolsMessage.style.display = 'block';
        } else {
            noPoolsMessage.style.display = 'none';
        }
    }

    console.log(`Filtered and sorted ${visibleCards.length} pools`);
}

function updateStatCounters(poolCount, tvl, avgApy) {
    const totalPoolsEl = getElement('total-pools');
    const totalTvlEl = getElement('total-tvl');
    const avgApyEl = getElement('avg-apy');

    if (totalPoolsEl) totalPoolsEl.textContent = poolCount;
    if (totalTvlEl) totalTvlEl.textContent = tvl;
    if (avgApyEl) avgApyEl.textContent = `${avgApy}%`;
}

async function loadDeveloperPools() {
    console.log("=== LOADING DEVELOPER POOLS ===");
    console.log("Current account:", currentAccount);
    console.log("Factory contract:", !!factoryContract);
    
    if (!currentAccount || !factoryContract) {
        console.log("Cannot load developer pools - missing account or contract");
        return;
    }
    
    try {
        console.log("Loading developer pools for:", currentAccount);
        const dashboardPools = getElement('dashboard-pools');
        const noDevPools = getElement('no-dev-pools');
        
        if (!dashboardPools) {
            console.error("Dashboard pools container not found!");
            return;
        }
        
        console.log("Dashboard container found, clearing existing pools...");
        
        // Clear existing pools and intervals for dashboard
        const existingDashboardPools = dashboardPools.querySelectorAll('.dev-pool-card');
        console.log("Existing pools to clear:", existingDashboardPools.length);
        
        existingDashboardPools.forEach(pool => {
            pool.remove();
        });
        
        console.log("Calling factoryContract.getPoolsByDeveloper...");
        const devPools = await factoryContract.getPoolsByDeveloper(currentAccount);
        console.log("Developer pools found:", devPools.length);
        console.log("Pool addresses:", devPools);
        
        if (devPools.length === 0) {
            console.log("No developer pools found, showing no-dev-pools message");
            if (noDevPools) noDevPools.style.display = 'block';
            return;
        } else {
            console.log("Developer pools found, hiding no-dev-pools message");
            if (noDevPools) noDevPools.style.display = 'none';
        }
        
        console.log("Creating developer pool cards...");
        for (const poolAddress of devPools) {
            console.log("Creating developer card for pool:", poolAddress);
            const poolData = await getDeveloperPoolData(poolAddress);
            const poolCard = createDeveloperPoolCard(poolData);
            dashboardPools.appendChild(poolCard);
        }
        
        console.log("Developer pools loaded successfully");
        
    } catch (error) {
        console.error("Error loading developer pools:", error);
        showNotification('Error loading your pools', 'error');
    }
}

// Add this new function to manually trigger developer pool loading (for debugging)
async function debugLoadDeveloperPools() {
    console.log("=== MANUAL DEBUG TRIGGER ===");
    await loadDeveloperPools();
}

window.debugLoadDeveloperPools = debugLoadDeveloperPools;

async function lookupTokenInfo() {
    if (!web3Provider) {
        showNotification('Please connect your wallet first', 'warning');
        return;
    }

    const tokenAddress = getElement('token-address')?.value;
    if (!tokenAddress || !ethers.isAddress(tokenAddress)) return;

    try {
        showLoading('Looking up token...');

        const signer = await web3Provider.getSigner();
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

        const [name, symbol] = await Promise.all([
            tokenContract.name(),
            tokenContract.symbol()
        ]);

        const tokenNameEl = getElement('token-name');
        const tokenSymbolEl = getElement('token-symbol');

        if (tokenNameEl) tokenNameEl.value = name;
        if (tokenSymbolEl) tokenSymbolEl.value = symbol;

        hideLoading();
    } catch (error) {
        console.error("Error looking up token:", error);
        showNotification('Error retrieving token information', 'error');
        hideLoading();
    }
}

async function openPoolDetails(poolAddress) {
    try {
        showLoading('Loading pool details...');

        const poolData = await getPoolData(poolAddress);
        const isSteakPool = poolAddress.toLowerCase() === STEAK_POOL_ADDRESS.toLowerCase();

        const detailElements = {
            logo: getElement('detail-pool-logo'),
            name: getElement('detail-pool-name'),
            symbol: getElement('detail-pool-symbol'),
            address: getElement('detail-pool-address'),
            apy: getElement('detail-apy'),
            totalStaked: getElement('detail-total-staked'),
            rewardRate: getElement('detail-reward-rate'),
            userStaked: getElement('detail-user-staked'),
            userRewards: getElement('detail-user-rewards'),
            pendingRewards: getElement('pending-rewards')
        };

        if (detailElements.logo) detailElements.logo.src = poolData.imageUrl || 'images/steak2.webp';
        if (detailElements.name) detailElements.name.textContent = isSteakPool ? `${poolData.name} (Official)` : poolData.name;
        if (detailElements.symbol) detailElements.symbol.textContent = poolData.symbol;
        if (detailElements.address) {
            detailElements.address.textContent = poolData.address;
            if (poolData.isOwner) {
                detailElements.address.style.cursor = 'pointer';
                detailElements.address.style.color = '#007bff';
                detailElements.address.title = 'Click to copy';
                detailElements.address.onclick = () => copyToClipboard(poolData.address);
            }
        }
        if (detailElements.apy) detailElements.apy.textContent = `${poolData.apy}%`;
        if (detailElements.totalStaked) detailElements.totalStaked.textContent = `${parseFloat(poolData.tvl).toFixed(2)} ${poolData.symbol}`;
        if (detailElements.rewardRate) detailElements.rewardRate.textContent = `${parseFloat(poolData.rewardRate).toFixed(8)} ${poolData.symbol}/sec`;

        const apyWarning = getElement('detail-apy-warning');
        if (apyWarning) {
            apyWarning.style.display = poolData.isLowTVL && poolData.tvlNumeric > 0 ? 'block' : 'none';
        }

        if (detailElements.userStaked) detailElements.userStaked.textContent = `${parseFloat(poolData.userStaked).toFixed(4)} ${poolData.symbol}`;
        if (detailElements.userRewards) detailElements.userRewards.textContent = `${parseFloat(poolData.userRewards).toFixed(4)} ${poolData.symbol}`;
        if (detailElements.pendingRewards) detailElements.pendingRewards.textContent = `${parseFloat(poolData.userRewards).toFixed(4)} ${poolData.symbol}`;

        // Add tax info for STEAK pool
        const taxInfo = getElement('detail-tax-info') || document.createElement('div');
        taxInfo.id = 'detail-tax-info';
        taxInfo.style.cssText = 'font-size: 0.9em; color: #ff9800; margin: 10px 0;';
        taxInfo.textContent = isSteakPool ? '1% tax on deposits (reinvested) and withdrawals (to project wallet)' : '';
        if (!getElement('detail-tax-info')) {
            const detailsContent = document.querySelector('.pool-details-content');
            if (detailsContent) detailsContent.appendChild(taxInfo);
        }

        if (currentAccount && web3Provider) {
            const signer = await web3Provider.getSigner();
            const tokenContract = new ethers.Contract(poolData.stakingToken, ERC20_ABI, signer);
            const userBalance = await tokenContract.balanceOf(currentAccount);

            const userTokenBalance = getElement('user-token-balance');
            const userStakedBalance = getElement('user-staked-balance');

            if (userTokenBalance) userTokenBalance.textContent = `${parseFloat(ethers.formatUnits(userBalance, poolData.tokenDecimals)).toFixed(4)} ${poolData.symbol}`;
            if (userStakedBalance) userStakedBalance.textContent = `${parseFloat(poolData.userStaked).toFixed(4)} ${poolData.symbol}`;

            const stakeMaxBtn = getElement('stake-max-btn');
            const unstakeMaxBtn = getElement('unstake-max-btn');

            if (stakeMaxBtn) {
                stakeMaxBtn.onclick = () => {
                    const stakeAmount = getElement('stake-amount');
                    if (stakeAmount) {
                        stakeAmount.value = ethers.formatUnits(userBalance, poolData.tokenDecimals);
                    }
                };
            }

            if (unstakeMaxBtn) {
                unstakeMaxBtn.onclick = () => {
                    const unstakeAmount = getElement('unstake-amount');
                    if (unstakeAmount) {
                        unstakeAmount.value = poolData.userStaked;
                    }
                };
            }

            const ownerSection = getElement('pool-owner-section');
            console.log(`Opening pool details - Is Owner: ${poolData.isOwner}`);

            if (poolData.isOwner && ownerSection) {
                console.log('Showing pool owner section');
                ownerSection.style.display = 'block';

                if (!isSteakPool) {
                    const poolContract = new ethers.Contract(poolAddress, STAKING_POOL_ABI, signer);
                    const isPending = await poolContract.rewardRateUpdatePending();

                    if (isPending) {
                        const pendingRate = await poolContract.pendingRewardRate();
                        const updateTime = await poolContract.rewardRateUpdateTime();

                        const pendingRateEl = getElement('pending-rate');
                        const pendingRateTimeEl = getElement('pending-rate-time');

                        if (pendingRateEl) pendingRateEl.textContent = `${ethers.formatUnits(pendingRate, poolData.tokenDecimals)} ${poolData.symbol}/sec`;
                        if (pendingRateTimeEl) pendingRateTimeEl.textContent = new Date(Number(updateTime) * 1000).toLocaleString();

                        const pendingUpdates = getElement('pending-updates');
                        if (pendingUpdates) pendingUpdates.style.display = 'block';
                    } else {
                        const pendingUpdates = getElement('pending-updates');
                        if (pendingUpdates) pendingUpdates.style.display = 'none';
                    }
                } else {
                    const pendingUpdates = getElement('pending-updates');
                    if (pendingUpdates) pendingUpdates.style.display = 'none';
                }

                const rewardsMaxBtn = getElement('rewards-max-btn');
                if (rewardsMaxBtn) {
                    rewardsMaxBtn.onclick = async () => {
                        const userBalance = await tokenContract.balanceOf(currentAccount);
                        const addRewardsAmount = getElement('add-rewards-amount');
                        if (addRewardsAmount) {
                            addRewardsAmount.value = ethers.formatUnits(userBalance, poolData.tokenDecimals);
                        }
                    };
                }
            } else if (ownerSection) {
                console.log('Hiding pool owner section - not owner');
                ownerSection.style.display = 'none';
            }
        }

        const modal = getElement('pool-details-modal');
        if (modal) {
            modal.setAttribute('data-address', poolAddress);
            clearModalUpdateInterval();

            modalUpdateInterval = setInterval(async () => {
                if (modal.style.display !== 'flex') {
                    clearModalUpdateInterval();
                    return;
                }
                try {
                    const updatedData = await getPoolData(poolAddress);
                    if (detailElements.apy) detailElements.apy.textContent = `${updatedData.apy}%`;
                    if (detailElements.totalStaked) detailElements.totalStaked.textContent = `${parseFloat(updatedData.tvl).toFixed(2)} ${updatedData.symbol}`;
                    if (isConnected) {
                        if (detailElements.userStaked) detailElements.userStaked.textContent = `${parseFloat(updatedData.userStaked).toFixed(4)} ${updatedData.symbol}`;
                        if (detailElements.userRewards) detailElements.userRewards.textContent = `${parseFloat(updatedData.userRewards).toFixed(4)} ${updatedData.symbol}`;
                        if (detailElements.pendingRewards) detailElements.pendingRewards.textContent = `${parseFloat(updatedData.userRewards).toFixed(4)} ${updatedData.symbol}`;
                    }
                } catch (error) {
                    console.error('Error updating pool details:', error);
                }
            }, 30000);

            modal.style.display = 'flex';
        }

        hideLoading();
    } catch (error) {
        console.error("Error opening pool details:", error);
        showNotification('Error loading pool details', 'error');
        hideLoading();
    }
}

function setupPoolModalEvents() {
    const stakeBtn = getElement('stake-btn');
    if (stakeBtn) {
        stakeBtn.addEventListener('click', async () => {
            if (!currentAccount) {
                showNotification('Please connect your wallet first', 'warning');
                return;
            }

            const modal = getElement('pool-details-modal');
            const poolAddress = modal?.getAttribute('data-address');
            const amount = getElement('stake-amount')?.value;

            if (!amount || parseFloat(amount) <= 0) {
                showNotification('Please enter a valid amount', 'warning');
                return;
            }

            if (poolAddress) {
                await stakeTokens(poolAddress, amount);
            }
        });
    }

    const unstakeBtn = getElement('unstake-btn');
    if (unstakeBtn) {
        unstakeBtn.addEventListener('click', async () => {
            if (!currentAccount) {
                showNotification('Please connect your wallet first', 'warning');
                return;
            }

            const modal = getElement('pool-details-modal');
            const poolAddress = modal?.getAttribute('data-address');
            const amount = getElement('unstake-amount')?.value;

            if (!amount || parseFloat(amount) <= 0) {
                showNotification('Please enter a valid amount', 'warning');
                return;
            }

            if (poolAddress) {
                await unstakeTokens(poolAddress, amount);
            }
        });
    }

    const claimBtn = getElement('claim-rewards-btn');
    if (claimBtn) {
        claimBtn.addEventListener('click', async () => {
            if (!currentAccount) {
                showNotification('Please connect your wallet first', 'warning');
                return;
            }

            const modal = getElement('pool-details-modal');
            const poolAddress = modal?.getAttribute('data-address');

            if (poolAddress) {
                await claimRewards(poolAddress);
            }
        });
    }

    const addRewardsBtn = getElement('add-rewards-btn');
    if (addRewardsBtn) {
        addRewardsBtn.addEventListener('click', async () => {
            if (!currentAccount) {
                showNotification('Please connect your wallet first', 'warning');
                return;
            }

            const modal = getElement('pool-details-modal');
            const poolAddress = modal?.getAttribute('data-address');
            const amount = getElement('add-rewards-amount')?.value;

            if (!amount || parseFloat(amount) <= 0) {
                showNotification('Please enter a valid amount', 'warning');
                return;
            }

            if (poolAddress) {
                await addRewards(poolAddress, amount);
            }
        });
    }

    const updateRateBtn = getElement('update-rate-btn');
    if (updateRateBtn) {
        updateRateBtn.addEventListener('click', async () => {
            if (!currentAccount) {
                showNotification('Please connect your wallet first', 'warning');
                return;
            }

            const modal = getElement('pool-details-modal');
            const poolAddress = modal?.getAttribute('data-address');
            const newRate = getElement('new-reward-rate')?.value;

            if (!newRate || parseFloat(newRate) < 0) {
                showNotification('Please enter a valid rate', 'warning');
                return;
            }

            if (poolAddress) {
                await scheduleRateUpdate(poolAddress, newRate);
            }
        });
    }

    const applyRateBtn = getElement('apply-rate-btn');
    if (applyRateBtn) {
        applyRateBtn.addEventListener('click', async () => {
            if (!currentAccount) {
                showNotification('Please connect your wallet first', 'warning');
                return;
            }

            const modal = getElement('pool-details-modal');
            const poolAddress = modal?.getAttribute('data-address');

            if (poolAddress) {
                await applyRateUpdate(poolAddress);
            }
        });
    }
}

// Modified handleCreatePool function for Pinata
// Replace your handleCreatePool function with this debug version
async function handleCreatePool(e) {
    e.preventDefault();

    if (!currentAccount) {
        showNotification('Please connect your wallet first', 'warning');
        return;
    }

    try {
        console.log("=== POOL CREATION DEBUG START ===");
        
        // Retrieve DOM elements
        const tokenAddressInput = getElement('token-address');
        const tokenNameInput = getElement('token-name');
        const tokenSymbolInput = getElement('token-symbol');
        const initialRewardsInput = getElement('initial-rewards');
        const rewardRateInput = getElement('reward-rate');

        // Check if all required elements exist
        if (!tokenAddressInput || !tokenNameInput || !tokenSymbolInput ||
            !initialRewardsInput || !rewardRateInput) {
            console.error('One or more form elements are missing');
            showNotification('Form is incomplete. Please ensure all fields are available.', 'error');
            return;
        }

        // Retrieve values
        const tokenAddress = tokenAddressInput.value;
        const tokenName = tokenNameInput.value;
        const tokenSymbol = tokenSymbolInput.value;
        const initialRewards = initialRewardsInput.value;
        const rewardRate = rewardRateInput.getAttribute('data-rate') || rewardRateInput.value;

        console.log("Form values:", {
            tokenAddress,
            tokenName,
            tokenSymbol,
            initialRewards,
            rewardRate,
            uploadedImageHash
        });

        // Validation checks
        if (!tokenAddress || !ethers.isAddress(tokenAddress)) {
            showNotification('Please enter a valid token address', 'warning');
            return;
        }

        if (!tokenName || !tokenSymbol) {
            showNotification('Please enter token name and symbol', 'warning');
            return;
        }

        if (!rewardRate || parseFloat(rewardRate) <= 0) {
            showNotification('Invalid reward rate calculation', 'warning');
            return;
        }

        if (!initialRewards || parseFloat(initialRewards) <= 0) {
            showNotification('Please enter a valid initial rewards amount', 'warning');
            return;
        }

        showLoading('Creating staking pool...');

        // Use uploaded image or generate one based on symbol
        const imageUrl = uploadedImageHash || generateCashTagImage(tokenSymbol);
        console.log("Image URL:", imageUrl);

        const signer = await web3Provider.getSigner();
        console.log("Signer obtained:", await signer.getAddress());

        // Check token contract
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        console.log("Token contract created");

        let decimals;
        try {
            decimals = await tokenContract.decimals();
            console.log("Token decimals:", decimals);
        } catch (decimalError) {
            console.error("Error getting token decimals:", decimalError);
            hideLoading();
            showNotification('Error reading token contract. Please verify the token address.', 'error');
            return;
        }

        // Check user's token balance
        try {
            const userBalance = await tokenContract.balanceOf(currentAccount);
            const userBalanceFormatted = ethers.formatUnits(userBalance, decimals);
            console.log("User token balance:", userBalanceFormatted, tokenSymbol);
            
            if (parseFloat(userBalanceFormatted) < parseFloat(initialRewards)) {
                hideLoading();
                showNotification(`Insufficient ${tokenSymbol} balance. You have ${userBalanceFormatted} but need ${initialRewards}`, 'error');
                return;
            }
        } catch (balanceError) {
            console.error("Error checking token balance:", balanceError);
            hideLoading();
            showNotification('Error checking your token balance', 'error');
            return;
        }

        const rewardRateBN = ethers.parseUnits(parseFloat(rewardRate).toFixed(18), decimals);
        const initialRewardsBN = ethers.parseUnits(initialRewards, decimals);

        console.log("Parsed values:", {
            rewardRateBN: rewardRateBN.toString(),
            initialRewardsBN: initialRewardsBN.toString()
        });

        // Check factory contract and fee
        const poolCreationFee = await factoryContract.poolCreationFee();
        console.log("Pool creation fee:", ethers.formatEther(poolCreationFee), "PLS");

        // Check user's PLS balance
        const userPLSBalance = await web3Provider.getBalance(currentAccount);
        console.log("User PLS balance:", ethers.formatEther(userPLSBalance), "PLS");

        if (userPLSBalance < poolCreationFee) {
            hideLoading();
            showNotification(`Insufficient PLS for pool creation fee. Need ${ethers.formatEther(poolCreationFee)} PLS`, 'error');
            return;
        }

        console.log("About to call createPool with parameters:", {
            tokenAddress,
            tokenName,
            tokenSymbol,
            imageUrl,
            rewardRate: rewardRateBN.toString(),
            fee: poolCreationFee.toString()
        });

        try {
            // Estimate gas first
            const gasEstimate = await factoryContract.createPool.estimateGas(
                tokenAddress,
                tokenName,
                tokenSymbol,
                imageUrl,
                rewardRateBN,
                { value: poolCreationFee }
            );
            console.log("Gas estimate:", gasEstimate.toString());

            const createTx = await factoryContract.createPool(
                tokenAddress,
                tokenName,
                tokenSymbol,
                imageUrl,
                rewardRateBN,
                { 
                    value: poolCreationFee,
                    gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
                }
            );

            console.log("Create pool transaction sent:", createTx.hash);
            const receipt = await createTx.wait();
            console.log("Pool creation confirmed:", receipt);

            const poolCount = await factoryContract.getPoolCount();
            const indexToCheck = Number(poolCount) - 1;
            const newPoolAddress = await factoryContract.stakingPools(indexToCheck);
            console.log("New pool address:", newPoolAddress);

            const poolContract = new ethers.Contract(newPoolAddress, STAKING_POOL_ABI, signer);
            
            console.log("Approving tokens for initial rewards...");
            const addRewardsTx = await tokenContract.approve(newPoolAddress, initialRewardsBN);
            await addRewardsTx.wait();
            console.log("Token approval confirmed");

            console.log("Adding initial rewards...");
            const rewardsTx = await poolContract.addRewards(initialRewardsBN);
            await rewardsTx.wait();
            console.log("Initial rewards added");

            hideLoading();

            showNotification(`Staking pool created and funded successfully! Address: ${newPoolAddress}`, 'success');

            getElement('create-pool-form').reset();

            // Clear image upload
            uploadedImageHash = null;
            const imagePreview = getElement('image-preview');
            const uploadStatus = getElement('upload-status');
            if (imagePreview) imagePreview.innerHTML = '';
            if (uploadStatus) uploadStatus.innerHTML = '';

            // Clear intervals and refresh pools
            clearAllPoolCardIntervals();
            await loadPools();

            // Load developer pools
            setTimeout(async () => {
                await loadDeveloperPools();
            }, 1000);

            // Smooth scroll to dashboard
            const dashboard = getElement('dashboard');
            if (dashboard) dashboard.scrollIntoView({ behavior: 'smooth' });

        } catch (txError) {
            console.error("=== TRANSACTION ERROR DETAILS ===");
            console.error("Error object:", txError);
            console.error("Error code:", txError.code);
            console.error("Error reason:", txError.reason);
            console.error("Error message:", txError.message);
            console.error("Error data:", txError.data);
            
            hideLoading();
            
            let errorMessage = 'Error creating pool: ';
            if (txError.reason) {
                errorMessage += txError.reason;
            } else if (txError.message) {
                errorMessage += txError.message;
            } else {
                errorMessage += 'Unknown transaction error';
            }
            
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        console.error("=== GENERAL ERROR ===");
        console.error("Error creating pool:", error);
        console.error("Error stack:", error.stack);
        showNotification('Error creating staking pool: ' + error.message, 'error');
        hideLoading();
    }
}

// Staking interaction functions
async function stakeTokens(poolAddress, amount) {
    try {
        showLoading('Staking tokens...');

        const signer = await web3Provider.getSigner();
        const poolContract = new ethers.Contract(poolAddress, STAKING_POOL_ABI, signer);

        const poolData = await getPoolData(poolAddress);

        const amountBN = ethers.parseUnits(amount, poolData.tokenDecimals);

        const tokenContract = new ethers.Contract(poolData.stakingToken, ERC20_ABI, signer);
        const approveTx = await tokenContract.approve(poolAddress, amountBN);
        await approveTx.wait();

        const stakeTx = await poolContract.stake(amountBN);
        await stakeTx.wait();

        hideLoading();

        showNotification(`Successfully staked ${amount} ${poolData.symbol}`, 'success');

        // Clear intervals and refresh
        clearAllPoolCardIntervals();
        await loadPools();
        await openPoolDetails(poolAddress);

    } catch (error) {
        console.error("Error staking tokens:", error);
        showNotification('Error staking tokens', 'error');
        hideLoading();
    }
}

async function unstakeTokens(poolAddress, amount) {
    try {
        showLoading('Unstaking tokens...');

        const signer = await web3Provider.getSigner();
        const poolContract = new ethers.Contract(poolAddress, STAKING_POOL_ABI, signer);

        const poolData = await getPoolData(poolAddress);

        const amountBN = ethers.parseUnits(amount, poolData.tokenDecimals);

        const unstakeTx = await poolContract.withdraw(amountBN);
        await unstakeTx.wait();

        hideLoading();

        showNotification(`Successfully unstaked ${amount} ${poolData.symbol}`, 'success');

        // Clear intervals and refresh
        clearAllPoolCardIntervals();
        await loadPools();
        await openPoolDetails(poolAddress);

    } catch (error) {
        console.error("Error unstaking tokens:", error);
        showNotification('Error unstaking tokens', 'error');
        hideLoading();
    }
}

async function claimRewards(poolAddress) {
    try {
        showLoading('Claiming rewards...');

        const signer = await web3Provider.getSigner();
        const poolContract = new ethers.Contract(poolAddress, STAKING_POOL_ABI, signer);

        const poolData = await getPoolData(poolAddress);

        const claimTx = await poolContract.claimRewards();
        await claimTx.wait();

        hideLoading();

        showNotification(`Successfully claimed ${poolData.userRewards} ${poolData.symbol}`, 'success');

        // Clear intervals and refresh
        clearAllPoolCardIntervals();
        await loadPools();
        await openPoolDetails(poolAddress);

    } catch (error) {
        console.error("Error claiming rewards:", error);
        showNotification('Error claiming rewards', 'error');
        hideLoading();
    }
}

async function addRewards(poolAddress, amount) {
    try {
        showLoading('Adding rewards...');

        const signer = await web3Provider.getSigner();
        const poolContract = new ethers.Contract(poolAddress, STAKING_POOL_ABI, signer);

        const poolData = await getPoolData(poolAddress);

        const amountBN = ethers.parseUnits(amount, poolData.tokenDecimals);

        const tokenContract = new ethers.Contract(poolData.stakingToken, ERC20_ABI, signer);
        const approveTx = await tokenContract.approve(poolAddress, amountBN);
        await approveTx.wait();

        const addRewardsTx = await poolContract.addRewards(amountBN);
        await addRewardsTx.wait();

        hideLoading();

        showNotification(`Successfully added ${amount} ${poolData.symbol} to rewards`, 'success');

        // Clear intervals and refresh
        clearAllPoolCardIntervals();
        await loadPools();
        await openPoolDetails(poolAddress);

    } catch (error) {
        console.error("Error adding rewards:", error);
        showNotification('Error adding rewards', 'error');
        hideLoading();
    }
}

async function scheduleRateUpdate(poolAddress, newRate) {
    try {
        showLoading('Scheduling rate update...');

        const signer = await web3Provider.getSigner();
        const isSteakPool = poolAddress.toLowerCase() === STEAK_POOL_ADDRESS.toLowerCase();
        const abi = isSteakPool ? STEAK_POOL_ABI : STAKING_POOL_ABI;
        const poolContract = new ethers.Contract(poolAddress, abi, signer);

        const poolData = await getPoolData(poolAddress);
        const rateBN = ethers.parseUnits(newRate, poolData.tokenDecimals);

        let updateTx;
        if (isSteakPool) {
            updateTx = await poolContract.scheduleRewardRateUpdate(rateBN);
        } else {
            updateTx = await poolContract.scheduleRewardRateUpdate(rateBN);
        }
        await updateTx.wait();

        hideLoading();
        showNotification(`Rate update ${isSteakPool ? 'applied immediately' : 'scheduled (will apply in 24 hours)'}`, 'success');
        await openPoolDetails(poolAddress);
    } catch (error) {
        console.error("Error scheduling rate update:", error);
        showNotification('Error scheduling rate update', 'error');
        hideLoading();
    }
}

async function applyRateUpdate(poolAddress) {
    try {
        showLoading('Applying rate update...');

        const signer = await web3Provider.getSigner();
        const poolContract = new ethers.Contract(poolAddress, STAKING_POOL_ABI, signer);

        const applyTx = await poolContract.applyRewardRateUpdate();
        await applyTx.wait();

        hideLoading();

        showNotification('Reward rate updated successfully', 'success');

        // Clear intervals and refresh
        clearAllPoolCardIntervals();
        await loadPools();
        await openPoolDetails(poolAddress);

    } catch (error) {
        console.error("Error applying rate update:", error);
        showNotification('Error applying rate update. Timelock may not have expired yet.', 'error');
        hideLoading();
    }
}

function generateCashTagImage(cashTag) {
    const tag = cashTag.trim() || getElement('token-symbol')?.value || 'S';

    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = ((hash << 5) - hash) + tag.charCodeAt(i);
        hash = hash & hash;
    }

    const hue = Math.abs(hash % 360);
    const color = "hsl(" + hue + ", 70%, 60%)";

    const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">' +
        '<circle cx="32" cy="32" r="30" fill="' + color + '" />' +
        '<text x="32" y="36" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="white">' +
        tag.substring(0, 4) + '</text></svg>';

    return "data:image/svg+xml;base64," + btoa(svgContent);
}

function formatAddress(address) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Pool address copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Pool address copied to clipboard!', 'success');
    });
}

function formatTVL(tvl) {
    if (tvl >= 1000000) {
        return `${(tvl / 1000000).toFixed(2)}M`;
    } else if (tvl >= 1000) {
        return `${(tvl / 1000).toFixed(2)}K`;
    } else {
        return `${tvl.toFixed(2)}`;
    }
}

function getPoolHealthStatus(poolData) {
    const tvl = parseFloat(poolData.tvl);
    const rewardRate = parseFloat(poolData.rewardRate);
    const rewardBalance = parseFloat(poolData.rewardBalance || 0);
    
    console.log(`Health check for ${poolData.symbol}: TVL=${tvl}, Rate=${rewardRate}, Balance=${rewardBalance}`);
    
    if (tvl === 0 && rewardRate === 0 && rewardBalance === 0) {
        return { status: 'empty', message: 'Not funded', color: '#dc3545' };
    } else if (tvl === 0 && rewardRate > 0 && rewardBalance > 0) {
        return { status: 'funded', message: 'Awaiting stakers', color: '#28a745' };
    } else if (tvl === 0 && rewardRate > 0 && rewardBalance === 0) {
        return { status: 'empty-rate', message: 'Rate set, no rewards', color: '#ff9800' };
    } else if (tvl > 0 && rewardBalance === 0) {
        return { status: 'staked-no-rewards', message: 'No rewards', color: '#ff9800' };
    } else if (tvl > 0 && rewardBalance > 0) {
        return { status: 'active', message: 'Active', color: '#28a745' };
    } else {
        return { status: 'unknown', message: 'Unknown', color: '#6c757d' };
    }
}

// Function to add pool health indicators to cards
function addPoolHealthIndicator(poolCard, poolData) {
    const health = getPoolHealthStatus(poolData);

    // Create health indicator element
    const healthIndicator = document.createElement('div');
    healthIndicator.className = 'pool-health-indicator';
    healthIndicator.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: bold;
        color: white;
        background-color: ${health.color};
        z-index: 2;
    `;
    healthIndicator.textContent = health.message;
    healthIndicator.title = `Pool Status: ${health.status}`;

    // Add to card header
    const poolHeader = poolCard.querySelector('.pool-header');
    if (poolHeader) {
        poolHeader.style.position = 'relative';
        poolHeader.appendChild(healthIndicator);
    }
}

function showNotification(message, type = 'info') {
    const container = getElement('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-times-circle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }

    notification.innerHTML = `${icon} ${message}`;
    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function showLoading(message = 'Processing...') {
    const overlay = getElement('loading-overlay');
    const loadingText = overlay?.querySelector('.loading-text');

    if (loadingText) {
        loadingText.textContent = message;
    }
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = getElement('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function setupWalletModal() {
    const modal = getElement('wallet-modal');
    if (!modal) {
        console.error("Wallet modal element not found!");
        return;
    }

    const closeButtons = document.querySelectorAll('[data-close-wallet-modal]');

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    const walletOptions = document.querySelectorAll('.wallet-option');
    walletOptions.forEach(option => {
        option.addEventListener('click', () => {
            const walletType = option.getAttribute('data-wallet');
            connectWithWallet(walletType);
            modal.style.display = 'none';
        });
    });
}

function showWalletSelectionModal() {
    const modal = getElement('wallet-modal');
    if (!modal) {
        console.error("Wallet modal element not found!");
        showNotification('Cannot show wallet selection. Please check the console for details.', 'error');
        return;
    }

    if (window.ethereum) {
        window.ethereum.request({ method: 'eth_chainId' })
            .then(chainId => {
                if (typeof chainId === 'string' && chainId.startsWith('0x')) {
                    modal.style.display = 'flex';
                } else {
                    showNotification('Please select an EVM-compatible network in your wallet', 'error');
                }
            })
            .catch(error => {
                console.error("Error checking chain type:", error);
                showNotification('Error detecting network type. Please ensure you have an EVM wallet like MetaMask selected', 'error');
            });
    } else {
        showNotification('Please install MetaMask or another EVM wallet', 'warning');
    }
}

async function connectWithWallet(walletType) {
    try {
        let isEVM = false;

        if (window.ethereum) {
            try {
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                isEVM = typeof chainId === 'string' && chainId.startsWith('0x');
            } catch (error) {
                isEVM = false;
            }
        } else if (walletType === 'okx' && window.okxwallet) {
            window.ethereum = window.okxwallet;
            isEVM = true;
        }

        if (!isEVM) {
            showNotification('This dApp only works with EVM-compatible wallets and networks', 'error');
            return;
        }

        await connectWallet();
    } catch (error) {
        console.error("Error connecting wallet:", error);
        showNotification('Failed to connect wallet', 'error');
    }
}

async function disconnectWallet() {
    currentAccount = null;
    web3Provider = null;
    factoryContract = null;
    isConnected = false;

    // Clear all intervals
    clearAllPoolCardIntervals();
    clearModalUpdateInterval();

    const connectBtn = getElement('connect-wallet');
    if (connectBtn) {
        connectBtn.innerHTML = `<i class="fas fa-wallet"></i> Connect Wallet`;
    }

    updateStatCounters(0, '0', '0');

    const poolsContainer = getElement('pools-container');
    if (poolsContainer) {
        const existingPools = poolsContainer.querySelectorAll('.pool-card');
        existingPools.forEach(pool => pool.remove());

        const noPoolsMessage = getElement('no-pools');
        if (noPoolsMessage) {
            noPoolsMessage.style.display = 'block';
        }
    }

    const developerDashboard = getElement('dashboard');
    if (developerDashboard) {
        developerDashboard.style.display = 'none';
    }

    const feeElement = getElement('pool-creation-fee');
    if (feeElement) {
        feeElement.textContent = 'Connect wallet to see fee';
    }

    showNotification('Wallet disconnected', 'info');
}

async function handleDeposit(section) {
    try {
        const amountInput = section.querySelector('#deposit-amount');
        const amount = amountInput.value;
        if (!amount || amount <= 0) {
            showNotification('Enter a valid amount', 'error');
            return;
        }

        // Placeholder for testing
        console.log(`Depositing ${amount} STEAK (1% tax applied)`);
        showNotification(`Deposit of ${amount} STEAK initiated`, 'success');

        // Live contract interaction (uncomment after deployment)
        /*
        const provider = await web3Provider;
        const signer = await provider.getSigner();
        const poolContract = new ethers.Contract(STEAK_POOL_ADDRESS, STEAK_POOL_ABI, signer);
        const tokenContract = new ethers.Contract(STEAK_TOKEN_ADDRESS, ERC20_ABI, signer);
        
        // Approve tokens
        const amountWei = ethers.parseEther(amount);
        await tokenContract.approve(STEAK_POOL_ADDRESS, amountWei);
        // Deposit
        const tx = await poolContract.deposit(amountWei);
        await tx.wait();
        showNotification(`Deposited ${amount} STEAK`, 'success');
        amountInput.value = '';
        await loadSteakPool(); // Refresh data
        */
    } catch (error) {
        console.error('Deposit error:', error);
        showNotification('Deposit failed', 'error');
    }
}

async function handleWithdraw(section) {
    try {
        const amountInput = section.querySelector('#withdraw-amount');
        const amount = amountInput.value;
        if (!amount || amount <= 0) {
            showNotification('Enter a valid amount', 'error');
            return;
        }

        // Placeholder for testing
        console.log(`Withdrawing ${amount} STEAK (1% tax applied)`);
        showNotification(`Withdrawal of ${amount} STEAK initiated`, 'success');

        // Live contract interaction (uncomment after deployment)
        /*
        const provider = await web3Provider;
        const signer = await provider.getSigner();
        const poolContract = new ethers.Contract(STEAK_POOL_ADDRESS, STEAK_POOL_ABI, signer);
        const amountWei = ethers.parseEther(amount);
        const tx = await poolContract.withdraw(amountWei);
        await tx.wait();
        showNotification(`Withdrew ${amount} STEAK`, 'success');
        amountInput.value = '';
        await loadSteakPool(); // Refresh data
        */
    } catch (error) {
        console.error('Withdraw error:', error);
        showNotification('Withdraw failed', 'error');
    }
}

async function handleClaim(section) {
    try {
        // Placeholder for testing
        console.log('Claiming rewards');
        showNotification('Rewards claim initiated', 'success');

        // Live contract interaction (uncomment after deployment)
        /*
        const provider = await web3Provider;
        const signer = await provider.getSigner();
        const poolContract = new ethers.Contract(STEAK_POOL_ADDRESS, STEAK_POOL_ABI, signer);
        const tx = await poolContract.claimRewards();
        await tx.wait();
        showNotification('Rewards claimed', 'success');
        await loadSteakPool(); // Refresh data
        */
    } catch (error) {
        console.error('Claim error:', error);
        showNotification('Claim failed', 'error');
    }
}