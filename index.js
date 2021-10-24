const dotenv = require('dotenv');
const ethers = require('ethers');
const config = require('./config.json');
const { BigNumber } = require('@ethersproject/bignumber');

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
const providerUrl = 'https://bsc-dataseed.binance.org';

const provider = new ethers.providers.JsonRpcProvider(providerUrl);

const walletWithProvider = new ethers.Wallet(privateKey, provider);

const contract = new ethers.Contract(config.contractAddress, config.abi, provider);
const contractWithSigner = contract.connect(walletWithProvider);

function calculateGasMargin(value) {
    return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000));
}

(async () => {
    const amountToBuy = ethers.utils.parseEther(config.amountToBuy);
    const numsTransaction = config.numsTransaction;

    try {
        const gasLimit = calculateGasMargin(await contractWithSigner.estimateGas['buyTokens(uint256)'](amountToBuy));

        await Promise.all(await Promise.all(
            Array.from(
                Array(numsTransaction)).map(
                    () => contractWithSigner['buyTokens(uint256)'](amountToBuy, {
                        gasLimit,
                        gasPrice: config.gasPrices.instance
                    })
                )
            )
        );
    } catch (error) {
        console.log(`error`, error.error);
    }
})();
