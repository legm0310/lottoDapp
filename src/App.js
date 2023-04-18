import {
  ConnectWallet,
  Web3Button,
  useAddress,
  useConnectionStatus,
  useContract,
  useContractMetadata,
  useContractRead,
  useContractWrite,
  useMetadata,
  useNetworkMismatch,
  useSDK,
  useSwitchChain,
  useTokenBalance,
} from "@thirdweb-dev/react";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { Sepolia } from "@thirdweb-dev/chains";
import "./styles/Home.css";
import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

const contractAddress = "0x8B1c3790686A0AbB14545409E9ce544b3D8EF966";
export default function Home() {
  const { contract } = useContract(contractAddress);
  const sdk = new ThirdwebSDK(Sepolia);
  const contractSdk = sdk?.getContract(contractAddress);
  const { data: Metadata } = useMetadata(contract);
  const connectionStatus = useConnectionStatus();
  const address = useAddress();
  const switchChain = useSwitchChain();
  const networkMismatch = useNetworkMismatch();
  const { data: balance, error } = useTokenBalance(contract, address);
  const { data: owner } = useContractRead(contract, "owner", []);
  const { mutateAsync: MintToUser } = useContractWrite(contract, "MintToUser");
  const { mutateAsync: lotto, isLoading } = useContractWrite(contract, "lotto");
  const { mutateAsync: adminMintToUser } = useContractWrite(
    contract,
    "adminMintToUser"
  );
  const { mutateAsync: sendToken } = useContractWrite(contract, "sendToken");

  const [bal, setBal] = useState(balance?.displayValue);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [mintAmount, setMintAmount] = useState(0);
  const [amount, setAmount] = useState(0);

  const [formValues, setFormValues] = useState({
    betNum: "",
    betAmount: "",
  });

  const handleFormChange = (e) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const changeAddress = (e) => {
    setRecipientAddress(e.target.value);
  };

  const changeMintAmount = (e) => {
    setMintAmount(e.target.value);
  };

  const changeAmount = (e) => {
    setAmount(e.target.value);
  };

  const handleBetting = async (e) => {
    try {
      if (networkMismatch) {
        switchChain && switchChain(Sepolia.chainId);
        return;
      }
      e.preventDefault();
    } catch {}
  };

  const playLotto = async (num, amount) => {
    try {
      const data = await lotto({ args: [num, amount] });
      console.log("contract call successs11111", data);
      return data;
    } catch (err) {
      console.error("contract call failure", err);
    }
  };

  const mintUser = async (amount) => {
    try {
      const data = await MintToUser({ args: [amount] });
      console.info("contract call successs", data);
    } catch (err) {
      console.error("contract call failure", err);
    }
  };

  const mintAdmin = async (to, amount) => {
    try {
      const data = await adminMintToUser({ args: [to, amount] });
      console.info("contract call successs", data);
    } catch (err) {
      console.error("contract call failure", err);
    }
  };

  const tokenSend = async (to, amount) => {
    try {
      const data = await sendToken({ args: [to, amount] });
      console.info("contract call successs", data);
    } catch (err) {
      console.error("contract call failure", err);
    }
  };

  return (
    <div className="container">
      <main className="main">
        <div>
          <h1 className="title">
            {" "}
            <a>로또</a> 당첨되고 부자되세요.
          </h1>

          {connectionStatus === "disconnected" ? (
            <p className="description">
              <code className="code">"인생 역전"</code>당첨되면 10배, 확률 1/5{" "}
              <code className="code">지갑 연결 후</code> 이용 가능합니다.{" "}
            </p>
          ) : (
            <p className="description">
              지나친 사행행위는 개인과 가정을 파탄냅니다.{" "}
              <code className="code">도박문제상담전화 : 1336</code> 1 ~ 5 사이의
              숫자와 배팅할 금액을 입력해주세요
            </p>
          )}

          {networkMismatch === true ? (
            <div className="connect">
              <button onClick={() => switchChain(Sepolia.chainId)}>
                Sepolia 테스트넷으로 바꾸기
              </button>
            </div>
          ) : (
            <div className="connect">
              <ConnectWallet
                dropdownPosition={{ side: "bottom", align: "center" }}
              />
            </div>
          )}
        </div>

        {connectionStatus === "disconnected" ? null : (
          <div>
            <div className="connect">
              잔액 : {balance?.displayValue || 0} {Metadata?.symbol || ""}(
              {Metadata?.name || ""})
            </div>

            <div className="grid">
              {owner == (address || "") ? (
                <div className="card">
                  <input
                    type="text"
                    name="recipient"
                    onChange={changeAddress}
                    placeholder="받는사람 주소"
                  />
                  <input
                    type="number"
                    name="value"
                    onChange={changeMintAmount}
                    placeholder="발급할 토큰 수"
                  />
                  <Web3Button
                    accentColor="#5204BF"
                    colorMode="dark"
                    contractAddress={contractAddress}
                    action={(contract) =>
                      mintAdmin(recipientAddress, mintAmount)
                    }
                    onSuccess={() => alert("발급완료!")}
                    onError={(err) => alert(err)}
                  >
                    토큰 발급하기
                  </Web3Button>
                </div>
              ) : null}

              <div className="card">
                <input
                  type="number"
                  name="value"
                  onChange={changeAmount}
                  placeholder="발급할 토큰 수"
                  on
                />
                <Web3Button
                  accentColor="#5204BF"
                  colorMode="dark"
                  contractAddress={contractAddress}
                  action={(contract) => mintUser(parseInt(amount))}
                  onSuccess={() => alert("발급완료!")}
                  onError={(err) => alert(err)}
                >
                  토큰 발급하기
                </Web3Button>
              </div>

              <div className="card">
                <form onSubmit={(e) => handleBetting(e)}>
                  <input
                    type="number"
                    name="betNum"
                    value={formValues.betNum}
                    onChange={handleFormChange}
                    placeholder="배팅할 숫자 0~9"
                  />
                  <input
                    type="number"
                    name="betAmount"
                    value={formValues.betAmount}
                    onChange={handleFormChange}
                    placeholder="배팅할 금액"
                  />
                  <Web3Button
                    accentColor="#5204BF"
                    colorMode="dark"
                    contractAddress={contractAddress}
                    action={async (contract) => {
                      await contract.call(
                        "lotto",
                        [
                          parseInt(formValues.betNum),
                          parseInt(formValues.betAmount),
                        ],
                        {
                          gasLimit: 150000,
                        }
                      );
                    }}
                    onSuccess={async () => {
                      const [resultNumber, resultValue] = await contract.call(
                        "getLottoResult",
                        [address]
                      );
                      const formattedResultValue =
                        ethers.utils.formatEther(resultValue);
                      console.log(`Result Number: ${resultNumber}`);
                      console.log(`Result Value: ${formattedResultValue}`);

                      if (formattedResultValue != 0) {
                        alert(
                          `당첨 !\n결과 : ${resultNumber}\n당첨금 : ${formattedResultValue}
                        `
                        );
                      }
                      alert(`낙첨 ..\n결과 : ${resultNumber}`);
                    }}
                    onError={(err) => alert(err)}
                  >
                    배팅하기
                  </Web3Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
