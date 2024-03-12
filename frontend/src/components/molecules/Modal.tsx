import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router";
import { v4 as uuid } from "uuid";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";

import Inputs from "../atoms/inputs";
import Button from "../atoms/button";
import { closeBtn } from "../../images/Icon";
import { Product } from "../../pages/View";
import { FACTORY_ABI } from "../../abi/factory";
import { useRecoilValue } from "recoil";
import { walletState } from "../../recoil/walletState";
import { formatEther } from "@ethersproject/units";
import { cn } from "../../utils/cn";

interface ModalProps {
    onClose: () => void;
    product: Product;
}

const Modal: React.FC<ModalProps> = ({ onClose, product }) => {
    const { id } = useParams();
    const [receiverInput, setReceiverInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const { walletAddress } = useRecoilValue(walletState);
    const priceETH = formatEther(product.price);
    const navigate = useNavigate();

    const runEthers = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const address = walletAddress;
            const signer = provider.getSigner(address);
            const UUID = uuid();

            const buyer = address;
            const seller = product.seller;
            const receiver = receiverInput;
            const market = process.env.REACT_APP_MARKET_ADDRESS;

            setLoading(true);

            const contract = new ethers.Contract(
                process.env.REACT_APP_PROXY_ADDRESS as any,
                FACTORY_ABI,
                provider
            );

            const transaction = {
                to: process.env.REACT_APP_PROXY_ADDRESS,
                data: contract.interface.encodeFunctionData("createEscrow", [
                    buyer,
                    seller,
                    receiver,
                    market,
                    ethers.utils.parseUnits(priceETH, "ether").toString(),
                    UUID,
                ]),
                value: ethers.utils.parseUnits(priceETH, "ether").toString(),
                gasLimit: 3000000,
            };
            console.log(transaction);

            await signer.sendTransaction(transaction);
            console.log("Transaction sign post body: ", {
                buyer,
                receiver,
                uuid: UUID,
            });

            const reqBody = {
                buyer,
                receiver,
                uuid: UUID,
            };

            const payUrl = `${
                process.env.REACT_APP_API || process.env.REACT_APP_AWS
            }/product/${id}/pay`;
            console.log(payUrl, reqBody);

            const response = await axios.post(payUrl, reqBody);
            console.log(response);

            if (response) {
                alert("정상적으로 선물을 보냈습니다! 선물함으로 이동합니다.");
                navigate("/gift");
            }
        } catch (error) {
            console.log("선물보내기에서 오류", error);
            alert("선물을 보내지못했습니다ㅠㅠ");
        } finally {
            setLoading(false);
        }
    };

    const sendGift = async () => {
        if (receiverInput.trim() !== "") {
            await runEthers();
        } else {
            alert("받는 사람 지갑 주소를 입력해주세요.");
        }
    };

    return (
        <>
            {onClose && (
                <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-70 z-50">
                    <div className="p-8 bg-white rounded-xl w-[30%]">
                        <div className=" float-right">
                            <button onClick={onClose}>
                                <img src={closeBtn} alt="" />
                            </button>
                        </div>
                        <div className="py-5">
                            <div>
                                <div className="mt-3 text-center ">
                                    <h3 className="text-2xl py-3 text-gray-900 ">
                                        {product.title} 선물 보내기
                                    </h3>

                                    <p className="py-3">
                                        금액 : {priceETH} ETH{" "}
                                    </p>

                                    <Inputs
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>
                                        ) => setReceiverInput(e.target.value)}
                                        type="text"
                                        size="xlg"
                                        placeholder="받는 사람 지갑 주소를 입력해주세요"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="px-4 py-3 flex justify-center ">
                            {loading ? (
                                <div
                                    className={cn(
                                        "flex justify-center items-center gap-4 ",
                                        "w-[300px] h-[50px] text-[20px] text-white rounded-xl bg-gradient-to-r from-[#ec4609] to-[#FFA787]"
                                    )}
                                >
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-8 w-8 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    <span className="font-bold">
                                        잠시만 기다려주세요..!
                                    </span>
                                </div>
                            ) : (
                                <Button
                                    onClick={sendGift}
                                    variant="sendBtn2"
                                    size="lg"
                                    label="결제 후 선물보내기"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Modal;
