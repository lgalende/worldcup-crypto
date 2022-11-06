const main = async () => {
  const metadata = "ipfs://QmWuJoLZntYPsNvbbL8doN3W3wjupfjfKBABozP5GbgJ4k";
  const usdcInstance = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
  const derc20 = "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1";

  const predictorPassFactory = await hre.ethers.getContractFactory("PredictorPass");
  const predictorPassContract = await predictorPassFactory.deploy(metadata, usdcInstance, 6);  // fixme usdcInstance

  await predictorPassContract.deployed();

  console.log("Predictor Pass address: ", predictorPassContract.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();