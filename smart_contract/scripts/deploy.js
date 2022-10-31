const main = async () => {
  const metadata = "ipfs://QmWuJoLZntYPsNvbbL8doN3W3wjupfjfKBABozP5GbgJ4k";

  const predictorPassFactory = await hre.ethers.getContractFactory("PredictorPass");
  const predictorPassContract = await predictorPassFactory.deploy(metadata);

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