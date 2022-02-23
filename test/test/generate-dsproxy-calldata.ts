import { Signer } from "@ethersproject/abstract-signer";
import { USDC, hUSDC } from "@hifi/helpers";
import { signERC2612Permit } from "eth-permit";
import { ethers } from "ethers";
import common from "mocha/lib/interfaces/common";

// import { abi } from "../artifacts/contracts/HifiProxyTarget.sol/HifiProxyTarget.json";
// import { abi as abiCollateral } from "./collateralAbi.json";
import { getPermitDigest, sign, userPrivateKey } from "./signatures";
import { MAX, bnify } from "./utils";

// const finalCalldata = dsProxy.interface.encodeFunctionData("execute", [targetContractAddress, calldata]);
// console.log("finalCalldata", finalCalldata);

//const DSProxyAbi = require("../abis/DSProxy.json");
describe("Deposit Collateral with signature", function () {
  it("Print it", async function () {
    const TargetContractAbi = [
      {
        inputs: [
          { internalType: "uint256", name: "expectedHTokenRequired", type: "uint256" },
          { internalType: "uint256", name: "actualHTokenRequired", type: "uint256" },
        ],
        name: "HifiProxyTarget__AddLiquidityHTokenSlippage",
        type: "error",
      },
      {
        inputs: [
          { internalType: "uint256", name: "expectedUnderlyingRequired", type: "uint256" },
          { internalType: "uint256", name: "actualUnderlyingRequired", type: "uint256" },
        ],
        name: "HifiProxyTarget__AddLiquidityUnderlyingSlippage",
        type: "error",
      },
      {
        inputs: [
          { internalType: "uint256", name: "expectedAmount", type: "uint256" },
          { internalType: "uint256", name: "actualAmount", type: "uint256" },
        ],
        name: "HifiProxyTarget__TradeSlippage",
        type: "error",
      },
      {
        inputs: [{ internalType: "address", name: "target", type: "address" }],
        name: "SafeErc20__CallToNonContract",
        type: "error",
      },
      { inputs: [], name: "SafeErc20__NoReturnData", type: "error" },
      {
        anonymous: false,
        inputs: [
          { indexed: true, internalType: "address", name: "borrower", type: "address" },
          { indexed: false, internalType: "uint256", name: "borrowAmount", type: "uint256" },
          { indexed: false, internalType: "uint256", name: "underlyingAmount", type: "uint256" },
        ],
        name: "BorrowHTokenAndBuyUnderlying",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, internalType: "address", name: "borrower", type: "address" },
          { indexed: false, internalType: "uint256", name: "borrowAmount", type: "uint256" },
          { indexed: false, internalType: "uint256", name: "underlyingAmount", type: "uint256" },
        ],
        name: "BorrowHTokenAndSellHToken",
        type: "event",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "underlyingOffered", type: "uint256" },
          { internalType: "uint256", name: "maxHTokenRequired", type: "uint256" },
        ],
        name: "addLiquidity",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "contract IErc20Permit", name: "underlying", type: "address" },
          { internalType: "uint256", name: "underlyingOffered", type: "uint256" },
          { internalType: "uint256", name: "maxHTokenRequired", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureHToken", type: "bytes" },
          { internalType: "bytes", name: "signatureUnderlying", type: "bytes" },
        ],
        name: "addLiquidityWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IHToken", name: "hToken", type: "address" },
          { internalType: "uint256", name: "borrowAmount", type: "uint256" },
        ],
        name: "borrowHToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "maxBorrowAmount", type: "uint256" },
          { internalType: "uint256", name: "underlyingOffered", type: "uint256" },
        ],
        name: "borrowHTokenAndAddLiquidity",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "contract IErc20Permit", name: "underlying", type: "address" },
          { internalType: "uint256", name: "maxBorrowAmount", type: "uint256" },
          { internalType: "uint256", name: "underlyingOffered", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureUnderlying", type: "bytes" },
        ],
        name: "borrowHTokenAndAddLiquidityWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "maxBorrowAmount", type: "uint256" },
          { internalType: "uint256", name: "underlyingOut", type: "uint256" },
        ],
        name: "borrowHTokenAndBuyUnderlying",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "borrowAmount", type: "uint256" },
          { internalType: "uint256", name: "minUnderlyingOut", type: "uint256" },
        ],
        name: "borrowHTokenAndSellHToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "hTokenOut", type: "uint256" },
          { internalType: "uint256", name: "maxUnderlyingIn", type: "uint256" },
        ],
        name: "buyHToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "hTokenOut", type: "uint256" },
          { internalType: "uint256", name: "maxUnderlyingAmount", type: "uint256" },
        ],
        name: "buyHTokenAndAddLiquidity",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "contract IErc20Permit", name: "underlying", type: "address" },
          { internalType: "uint256", name: "hTokenOut", type: "uint256" },
          { internalType: "uint256", name: "maxUnderlyingAmount", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureUnderlying", type: "bytes" },
        ],
        name: "buyHTokenAndAddLiquidityWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "uint256", name: "maxUnderlyingIn", type: "uint256" },
          { internalType: "uint256", name: "hTokenOut", type: "uint256" },
        ],
        name: "buyHTokenAndRepayBorrow",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "contract IErc20Permit", name: "underlying", type: "address" },
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "uint256", name: "maxUnderlyingIn", type: "uint256" },
          { internalType: "uint256", name: "hTokenOut", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureUnderlying", type: "bytes" },
        ],
        name: "buyHTokenAndRepayBorrowWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "contract IErc20Permit", name: "underlying", type: "address" },
          { internalType: "uint256", name: "hTokenOut", type: "uint256" },
          { internalType: "uint256", name: "maxUnderlyingIn", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureUnderlying", type: "bytes" },
        ],
        name: "buyHTokenWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "underlyingOut", type: "uint256" },
          { internalType: "uint256", name: "maxHTokenIn", type: "uint256" },
        ],
        name: "buyUnderlying",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "maxHTokenAmount", type: "uint256" },
          { internalType: "uint256", name: "underlyingOffered", type: "uint256" },
        ],
        name: "buyUnderlyingAndAddLiquidity",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "maxHTokenAmount", type: "uint256" },
          { internalType: "uint256", name: "underlyingOffered", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureHToken", type: "bytes" },
        ],
        name: "buyUnderlyingAndAddLiquidityWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "underlyingOut", type: "uint256" },
          { internalType: "uint256", name: "maxHTokenIn", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureHToken", type: "bytes" },
        ],
        name: "buyUnderlyingWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IErc20", name: "collateral", type: "address" },
          { internalType: "uint256", name: "depositAmount", type: "uint256" },
        ],
        name: "depositCollateral",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IErc20", name: "collateral", type: "address" },
          { internalType: "contract IHToken", name: "hToken", type: "address" },
          { internalType: "uint256", name: "depositAmount", type: "uint256" },
          { internalType: "uint256", name: "borrowAmount", type: "uint256" },
        ],
        name: "depositCollateralAndBorrowHToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IErc20", name: "collateral", type: "address" },
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "depositAmount", type: "uint256" },
          { internalType: "uint256", name: "maxBorrowAmount", type: "uint256" },
          { internalType: "uint256", name: "underlyingOffered", type: "uint256" },
        ],
        name: "depositCollateralAndBorrowHTokenAndAddLiquidity",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IErc20Permit", name: "collateral", type: "address" },
          { internalType: "contract IErc20Permit", name: "underlying", type: "address" },
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "depositAmount", type: "uint256" },
          { internalType: "uint256", name: "maxBorrowAmount", type: "uint256" },
          { internalType: "uint256", name: "underlyingOffered", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureCollateral", type: "bytes" },
          { internalType: "bytes", name: "signatureUnderlying", type: "bytes" },
        ],
        name: "depositCollateralAndBorrowHTokenAndAddLiquidityWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IErc20", name: "collateral", type: "address" },
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "depositAmount", type: "uint256" },
          { internalType: "uint256", name: "borrowAmount", type: "uint256" },
          { internalType: "uint256", name: "minUnderlyingOut", type: "uint256" },
        ],
        name: "depositCollateralAndBorrowHTokenAndSellHToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IErc20Permit", name: "collateral", type: "address" },
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "depositAmount", type: "uint256" },
          { internalType: "uint256", name: "borrowAmount", type: "uint256" },
          { internalType: "uint256", name: "minUnderlyingOut", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureCollateral", type: "bytes" },
        ],
        name: "depositCollateralAndBorrowHTokenAndSellHTokenWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IErc20Permit", name: "collateral", type: "address" },
          { internalType: "contract IHToken", name: "hToken", type: "address" },
          { internalType: "uint256", name: "depositAmount", type: "uint256" },
          { internalType: "uint256", name: "borrowAmount", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureCollateral", type: "bytes" },
        ],
        name: "depositCollateralAndBorrowHTokenWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IErc20Permit", name: "collateral", type: "address" },
          { internalType: "uint256", name: "depositAmount", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureCollateral", type: "bytes" },
        ],
        name: "depositCollateralWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "depositAmount", type: "uint256" },
          { internalType: "uint256", name: "underlyingOffered", type: "uint256" },
        ],
        name: "depositUnderlyingAsCollateralAndBorrowHTokenAndAddLiquidity",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IErc20Permit", name: "underlying", type: "address" },
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "depositAmount", type: "uint256" },
          { internalType: "uint256", name: "underlyingOffered", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureUnderlying", type: "bytes" },
        ],
        name: "depositUnderlyingAsCollateralAndBorrowHTokenAndAddLiquidityWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHToken", name: "hToken", type: "address" },
          { internalType: "uint256", name: "hTokenAmount", type: "uint256" },
        ],
        name: "redeemHToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHToken", name: "hToken", type: "address" },
          { internalType: "uint256", name: "hTokenAmount", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureHToken", type: "bytes" },
        ],
        name: "redeemHTokenWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "poolTokensBurned", type: "uint256" },
        ],
        name: "removeLiquidity",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "poolTokensBurned", type: "uint256" },
        ],
        name: "removeLiquidityAndRedeemHToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "poolTokensBurned", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureLPToken", type: "bytes" },
        ],
        name: "removeLiquidityAndRedeemHTokenWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IErc20", name: "collateral", type: "address" },
          { internalType: "uint256", name: "poolTokensBurned", type: "uint256" },
          { internalType: "uint256", name: "repayAmount", type: "uint256" },
          { internalType: "uint256", name: "withdrawAmount", type: "uint256" },
        ],
        name: "removeLiquidityAndRepayBorrowAndWithdrawCollateral",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IErc20", name: "collateral", type: "address" },
          { internalType: "uint256", name: "poolTokensBurned", type: "uint256" },
          { internalType: "uint256", name: "repayAmount", type: "uint256" },
          { internalType: "uint256", name: "withdrawAmount", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureLPToken", type: "bytes" },
        ],
        name: "removeLiquidityAndRepayBorrowAndWithdrawCollateralWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "poolTokensBurned", type: "uint256" },
          { internalType: "uint256", name: "minUnderlyingOut", type: "uint256" },
        ],
        name: "removeLiquidityAndSellHToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "poolTokensBurned", type: "uint256" },
          { internalType: "uint256", name: "minUnderlyingOut", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureLPToken", type: "bytes" },
        ],
        name: "removeLiquidityAndSellHTokenWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "poolTokensBurned", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureLPToken", type: "bytes" },
        ],
        name: "removeLiquidityWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IHToken", name: "hToken", type: "address" },
          { internalType: "uint256", name: "repayAmount", type: "uint256" },
        ],
        name: "repayBorrow",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IHToken", name: "hToken", type: "address" },
          { internalType: "uint256", name: "repayAmount", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureHToken", type: "bytes" },
        ],
        name: "repayBorrowWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "hTokenIn", type: "uint256" },
          { internalType: "uint256", name: "minUnderlyingOut", type: "uint256" },
        ],
        name: "sellHToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "hTokenIn", type: "uint256" },
          { internalType: "uint256", name: "minUnderlyingOut", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureHToken", type: "bytes" },
        ],
        name: "sellHTokenWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "underlyingIn", type: "uint256" },
          { internalType: "uint256", name: "minHTokenOut", type: "uint256" },
        ],
        name: "sellUnderlying",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "uint256", name: "underlyingIn", type: "uint256" },
          { internalType: "uint256", name: "minHTokenOut", type: "uint256" },
        ],
        name: "sellUnderlyingAndRepayBorrow",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "contract IErc20Permit", name: "underlying", type: "address" },
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "uint256", name: "underlyingIn", type: "uint256" },
          { internalType: "uint256", name: "minHTokenOut", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureUnderlying", type: "bytes" },
        ],
        name: "sellUnderlyingAndRepayBorrowWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "contract IErc20Permit", name: "underlying", type: "address" },
          { internalType: "uint256", name: "underlyingIn", type: "uint256" },
          { internalType: "uint256", name: "minHTokenOut", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureUnderlying", type: "bytes" },
        ],
        name: "sellUnderlyingWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHToken", name: "hToken", type: "address" },
          { internalType: "uint256", name: "underlyingAmount", type: "uint256" },
        ],
        name: "supplyUnderlying",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHToken", name: "hToken", type: "address" },
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "uint256", name: "underlyingAmount", type: "uint256" },
        ],
        name: "supplyUnderlyingAndRepayBorrow",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHToken", name: "hToken", type: "address" },
          { internalType: "contract IErc20Permit", name: "underlying", type: "address" },
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "uint256", name: "underlyingAmount", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureUnderlying", type: "bytes" },
        ],
        name: "supplyUnderlyingAndRepayBorrowWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IHToken", name: "hToken", type: "address" },
          { internalType: "contract IErc20Permit", name: "underlying", type: "address" },
          { internalType: "uint256", name: "underlyingAmount", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "bytes", name: "signatureUnderlying", type: "bytes" },
        ],
        name: "supplyUnderlyingWithSignature",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IErc20", name: "collateral", type: "address" },
          { internalType: "uint256", name: "withdrawAmount", type: "uint256" },
        ],
        name: "withdrawCollateral",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract WethInterface", name: "weth", type: "address" },
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
          { internalType: "contract IHifiPool", name: "hifiPool", type: "address" },
          { internalType: "uint256", name: "borrowAmount", type: "uint256" },
          { internalType: "uint256", name: "minUnderlyingOut", type: "uint256" },
        ],
        name: "wrapEthAndDepositAndBorrowHTokenAndSellHToken",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "contract WethInterface", name: "weth", type: "address" },
          { internalType: "contract IBalanceSheetV1", name: "balanceSheet", type: "address" },
        ],
        name: "wrapEthAndDepositCollateral",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
    ];
    const CollateralAbi = [
      {
        inputs: [
          { internalType: "string", name: "name_", type: "string" },
          { internalType: "string", name: "symbol_", type: "string" },
          { internalType: "uint8", name: "decimals_", type: "uint8" },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        inputs: [
          { internalType: "uint8", name: "v", type: "uint8" },
          { internalType: "bytes32", name: "r", type: "bytes32" },
          { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        name: "Erc20Permit__InvalidSignature",
        type: "error",
      },
      { inputs: [], name: "Erc20Permit__OwnerZeroAddress", type: "error" },
      {
        inputs: [{ internalType: "uint256", name: "deadline", type: "uint256" }],
        name: "Erc20Permit__PermitExpired",
        type: "error",
      },
      { inputs: [], name: "Erc20Permit__RecoveredOwnerZeroAddress", type: "error" },
      { inputs: [], name: "Erc20Permit__SpenderZeroAddress", type: "error" },
      { inputs: [], name: "Erc20__ApproveOwnerZeroAddress", type: "error" },
      { inputs: [], name: "Erc20__ApproveSpenderZeroAddress", type: "error" },
      { inputs: [], name: "Erc20__BurnZeroAddress", type: "error" },
      {
        inputs: [
          { internalType: "uint256", name: "allowance", type: "uint256" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "Erc20__InsufficientAllowance",
        type: "error",
      },
      {
        inputs: [
          { internalType: "uint256", name: "senderBalance", type: "uint256" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "Erc20__InsufficientBalance",
        type: "error",
      },
      { inputs: [], name: "Erc20__MintZeroAddress", type: "error" },
      { inputs: [], name: "Erc20__TransferRecipientZeroAddress", type: "error" },
      { inputs: [], name: "Erc20__TransferSenderZeroAddress", type: "error" },
      {
        anonymous: false,
        inputs: [
          { indexed: true, internalType: "address", name: "owner", type: "address" },
          { indexed: true, internalType: "address", name: "spender", type: "address" },
          { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "Approval",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, internalType: "address", name: "holder", type: "address" },
          { indexed: false, internalType: "uint256", name: "burnAmount", type: "uint256" },
        ],
        name: "Burn",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, internalType: "address", name: "beneficiary", type: "address" },
          { indexed: false, internalType: "uint256", name: "mintAmount", type: "uint256" },
        ],
        name: "Mint",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, internalType: "address", name: "from", type: "address" },
          { indexed: true, internalType: "address", name: "to", type: "address" },
          { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "Transfer",
        type: "event",
      },
      {
        inputs: [],
        name: "DOMAIN_SEPARATOR",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "PERMIT_TYPEHASH",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "holder", type: "address" },
          { internalType: "uint256", name: "burnAmount", type: "uint256" },
        ],
        name: "__godMode_burn",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "beneficiary", type: "address" },
          { internalType: "uint256", name: "mintAmount", type: "uint256" },
        ],
        name: "__godMode_mint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "address", name: "spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "decimals",
        outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "subtractedAmount", type: "uint256" },
        ],
        name: "decreaseAllowance",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "addedAmount", type: "uint256" },
        ],
        name: "increaseAllowance",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "name",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "nonces",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "uint8", name: "v", type: "uint8" },
          { internalType: "bytes32", name: "r", type: "bytes32" },
          { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        name: "permit",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "symbol",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "totalSupply",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "transfer",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "sender", type: "address" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "transferFrom",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "version",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
    ];

    const defaultProvider = ethers.getDefaultProvider("rinkeby");

    //const dsProxyAddress = "0xdf50278fccdFE2ac6175EEC87D57903CA5830dBe";
    //const dsProxy = new ethers.Contract(dsProxyAddress, DSProxyAbi, defaultProvider);
    const jsonProvide = new ethers.providers.JsonRpcProvider(
      "https://rinkeby.infura.io/v3/69330abf76d64cceb4793985c698384a",
      "rinkeby",
    );

    let provider = new ethers.providers.JsonRpcProvider(
      "https://rinkeby.infura.io/v3/69330abf76d64cceb4793985c698384a",
    );
    let wallet = new ethers.Wallet("f2863a607357690d3e8c41360d3e6b67975f9fd2c70af5e1e99ccdfc490c9796");

    wallet = wallet.connect(provider);

    wallet
      .getAddress()
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });

    const result = await signERC2612Permit(
      wallet,
      "0xEdBF2bCA5940CCe624b26f75Aaf3265bbB134831",
      "0xb1e020029EBAe05673Fc9166E12A8FC603da976C",
      "0xC7822280E63c0B7199e8606Ef778331905Ccf000",
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    );

    console.log("result", result);

    const targetContractAddress = "0xAa24191f69a4816b7C6a4e322640288390b0c09E";
    const targetContract = new ethers.Contract(targetContractAddress, TargetContractAbi, defaultProvider);
    const balanceSheet = "0x00f5BFC75c9E9e55F2d8FF67403B70B036d0B4ea";
    const collateralAddress = "0xf0Db9700A370693D258D28e177cE6269A1c9f502";
    const depositAmount = USDC("1000");
    const collateralContract = new ethers.Contract(collateralAddress, CollateralAbi, defaultProvider);

    const hifiPool = "0xCbda2Ad0fd86133b1d8613FD36FeDef38Af029Ba";
    const underlying = "0xf0Db9700A370693D258D28e177cE6269A1c9f502";
    const hToken = "0xE8f7c7d9d7Fed4F3282f10e8db4c3B370db12df5";
    const underlyingOffered = USDC("10");
    const maxHTokenRequired = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    const hTokenIn = hUSDC("9");
    const collateralDigest = getPermitDigest(
      await collateralContract.name(),
      collateralAddress,
      4,
      {
        owner: "0xb1e020029EBAe05673Fc9166E12A8FC603da976C",
        spender: "0xC7822280E63c0B7199e8606Ef778331905Ccf000",
        value: depositAmount,
      },
      bnify(await collateralContract.nonces("0xb1e020029EBAe05673Fc9166E12A8FC603da976C")),
      MAX,
    );
    console.log("collateralDigest", collateralDigest);
    const collateralSig = sign(collateralDigest, userPrivateKey);
    console.log("collateralSig: ", collateralSig);

    const deadline = MAX;
    const calldata = targetContract.interface.encodeFunctionData("depositCollateralWithSignature", [
      balanceSheet,
      collateralAddress,
      depositAmount,
      deadline,
      collateralSig,
    ]);
    console.log("calldata: ", calldata);

    // get Htoken

    const calldataBorrowHToken = targetContract.interface.encodeFunctionData("borrowHToken", [
      balanceSheet,
      hToken,
      "100000000000000000000",
    ]);

    console.log("calldataBorrowHToken", calldataBorrowHToken);

    // AddLiquidity
    const hTokenContract = new ethers.Contract(hToken, CollateralAbi, defaultProvider);
    const hTokenDigest = getPermitDigest(
      "HiFi USDC Permit",
      hToken,
      4,
      {
        owner: "0xb1e020029EBAe05673Fc9166E12A8FC603da976C",
        spender: "0xC7822280E63c0B7199e8606Ef778331905Ccf000",
        value: hTokenIn,
      },
      bnify(await hTokenContract.nonces("0xb1e020029EBAe05673Fc9166E12A8FC603da976C")),
      MAX,
    );
    console.log("nounce htoke", bnify(await hTokenContract.nonces("0xb1e020029EBAe05673Fc9166E12A8FC603da976C")));
    console.log("hTokenDigest", hTokenDigest);
    const signatureHToken = sign(hTokenDigest, userPrivateKey);

    const underlyingDigest = getPermitDigest(
      "USDC",
      underlying,
      4,
      {
        owner: "0xb1e020029EBAe05673Fc9166E12A8FC603da976C",
        spender: "0xC7822280E63c0B7199e8606Ef778331905Ccf000",
        value: underlyingOffered,
      },
      bnify(await collateralContract.nonces("0xb1e020029EBAe05673Fc9166E12A8FC603da976C")),
      MAX,
    );
    console.log("hTokenDigest", underlyingDigest);
    const signatureUnderlying = sign(underlyingDigest, userPrivateKey);

    const calldataAddLiquidityWithSignature = targetContract.interface.encodeFunctionData("addLiquidityWithSignature", [
      hifiPool,
      underlying,
      underlyingOffered,
      maxHTokenRequired,
      deadline,
      signatureHToken,
      signatureUnderlying,
    ]);

    console.log("calldataAddLiquidityWithSignature", calldataAddLiquidityWithSignature);

    //sellHTokenWithSignature

    const minUnderlyingOut = 0;
    const calldatasellHTokenWithSignature = targetContract.interface.encodeFunctionData("sellHTokenWithSignature", [
      hifiPool,
      hTokenIn,
      minUnderlyingOut,
      deadline,
      signatureHToken,
    ]);

    console.log("calldatasellHTokenWithSignature", calldatasellHTokenWithSignature);

    // borrowHTokenAndAddLiquidityWithSignature
    const maxBorrowAmount = MAX;
    const calldataborrowHTokenAndAddLiquidityWithSignature = targetContract.interface.encodeFunctionData(
      "borrowHTokenAndAddLiquidityWithSignature",
      [balanceSheet, hifiPool, underlying, maxBorrowAmount, underlyingOffered, deadline, signatureUnderlying],
    );

    console.log("calldataborrowHTokenAndAddLiquidityWithSignature", calldataborrowHTokenAndAddLiquidityWithSignature);

    // end
  });
});
