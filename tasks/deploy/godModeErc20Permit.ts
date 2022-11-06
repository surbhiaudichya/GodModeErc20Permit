import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { GodModeErc20Permit } from "../../src/types/GodModeErc20Permit";
import { GodModeErc20Permit__factory } from "../../src/types/factories/GodModeErc20Permit__factory";

task("deploy:GodModeErc20Permit")
  .addParam("name", "ERC-20Permit name of the erc20PermitToken")
  .addParam("symbol", "ERC-20Permit symbol of the erc20PermitToken")
  .addParam("decimal", "ERC-20Permit decimal of the erc20PermitToken")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const godModeErc20PermitFactory: GodModeErc20Permit__factory = <GodModeErc20Permit__factory>(
      await ethers.getContractFactory("GodModeErc20Permit")
    );
    const godModeErc20Permit: GodModeErc20Permit = <GodModeErc20Permit>(
      await godModeErc20PermitFactory.deploy(taskArguments.name, taskArguments.symbol, taskArguments.decimal)
    );
    await godModeErc20Permit.deployed();
    console.log("GodModeErc20Permit contract deployed address: ", godModeErc20Permit.address);
  });
