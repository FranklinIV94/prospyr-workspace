// Deploy script for InvoiceFi contracts
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  // Deploy InvoiceToken
  const InvoiceToken = await ethers.getContractFactory("InvoiceToken");
  const invoiceToken = await InvoiceToken.deploy();
  await invoiceToken.waitForDeployment();
  console.log("InvoiceToken deployed to:", await invoiceToken.getAddress());

  // Deploy InvoiceMarket with fee recipient
  const InvoiceMarket = await ethers.getContractFactory("InvoiceMarket");
  const invoiceMarket = await InvoiceMarket.deploy(deployer.address);
  await invoiceMarket.waitForDeployment();
  console.log("InvoiceMarket deployed to:", await invoiceMarket.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
