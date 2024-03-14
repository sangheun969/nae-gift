import React, { useEffect, useState, useCallback } from "react";
import MyProductList from "../components/templates/MyProductList";
import MyVerifiedBox from "../components/templates/MyVerifiedBox";
import axios from "axios";
import { ethers } from "ethers";
import Pagination from "react-js-pagination";
import Button from "../components/atoms/button";
import { copyIcon } from "../images/Icon";
import { personIcon } from "../images/Icon";
import StoreBanner from "../components/molecules/StoreBanner";

export interface Data {
  nextPage: number;
  products: [];
  productsCount: number;
  totalPages: number;
}

export interface Product {
  id: number;
  title: string;
  image: string;
  price: string;
  seller: string;
}

export interface DataGift {
  nextPage: number;
  gifts: [];
  productsCount: number;
  totalPages: number;
}

export interface Gift {
  id: number;
  title: string;
  content: string;
  image: string;
  price: string;
  seller: string;
  buyer: string;
  receiver: string;
  contract: string;
  state: string;
  updatedAt: string;
}

const MyStoreList: React.FC = () => {
  const [product, setProduct] = useState<Product[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [userAddress] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [order, setOrder] = useState<string>("desc");
  const [seller, setSeller] = useState<string>("");
  const [totalPage, setTotalPage] = useState<number>(1);
  const [giftTotalPage, setGiftTotalPage] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const [showBanner, setShowBanner] = useState<boolean>(true);

  const changePage = async (pageNumber: number) => {
    setPage(pageNumber);
  };

  console.log(scrollPosition);

  const handlePageChange = (pageNumber: number) => {
    setPage(pageNumber);
  };

  useEffect(() => {
    const getWalletAddress = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const userAddress = await signer.getAddress();

          setSeller(userAddress);
        } catch (error) {
          console.log("자갑주소 가져오기 에러", error);
        }
      } else {
        console.log("메타마스크 설치하십시오");
      }
    };

    getWalletAddress();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get<Data>(
        `${
          // process.env.REACT_APP_API ||
          process.env.REACT_APP_AWS
        }/store?seller=${seller}&page=${page}&order=${order}`
      );

      setTotalPage(response.data.totalPages);
      setProduct(response.data.products);
      console.log(response.data);
    } catch (error) {
      console.error("데이터를 불러오는 중 에러 발생:", error);
    }
  };

  const fetchGifts = async () => {
    try {
      const responseGift = await axios.get<DataGift>(
        `${
          // process.env.REACT_APP_API ||
          process.env.REACT_APP_AWS
        }/store/verified?seller=${seller}&page=${page}&order=${order}`
      );
      setGifts(responseGift.data.gifts);
      setGiftTotalPage(responseGift.data.totalPages);
      console.log("기프트", responseGift.data);
    } catch (error) {
      console.error("Error fetching gifts:", error);
    }
  };

  const orderChange = (selected: string) => {
    setOrder(selected);
  };

  const orderChangeGift = (selected: string) => {
    setOrder(selected);
  };

  useEffect((): void => {
    if (seller) {
      fetchData();
      fetchGifts();
    }
  }, [seller, page, order]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset;
      setScrollPosition(position);
      if (position > 600) {
        setShowBanner(false);
      } else {
        setShowBanner(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="mt-[97px]">
      <div
        className={`transition-opacity duration-500 ${
          showBanner ? "opacity-100" : "opacity-0"
        }`}
      >
        <StoreBanner />
      </div>

      <div
        className={`flex flex-row justify-around mt-[90px] mb-[50px] transition-opacity duration-500 ${
          showBanner ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="flex flex-col  w-[500px] h-[300px] sticky top-10">
          <div className="flex flex-row justify-around border p-2 ">
            <img src={personIcon} alt="" className="w-[30px] h-[30px]" />
            <h1>소유자 주소</h1>
            <div className="overflow-hidden text-ellipsis whitespace-nowrap w-[170px]">
              {seller}
            </div>
            <Button
              variant="basicBtn2"
              size="sm"
              onClick={() => copyToClipboard(seller)}
              className="w-[30px] h-[30px]"
            >
              <img src={copyIcon} />
            </Button>
          </div>
          {copied && (
            <div
              className={`copied-message transition-opacity duration-500 ${
                copied ? "opacity-90" : "opacity-0"
              }  bg-green-300 text-white p-2 rounded-md`}
            >
              복사되었습니다.
            </div>
          )}
          <div>Total Items: </div>
        </div>
        <div className="h-full w-[70%] ">
          <label>
            <div className="flex flex-row py-5 gap-5 px-20 mx-auto items-center">
              <Button
                variant="basicBtn2"
                size="md"
                label="최신순"
                onClick={() => orderChange("desc")}
              />
              <Button
                variant="basicBtn2"
                size="md"
                label="과거순"
                onClick={() => orderChange("asc")}
              />
            </div>
          </label>
          <MyProductList products={product} userAddress={userAddress} />
          <div className="w-full flex flex-row py-2 gap-5 justify-center items-center">
            <Pagination
              activePage={page}
              itemsCountPerPage={10}
              totalItemsCount={totalPage * 10}
              pageRangeDisplayed={5}
              prevPageText={"‹"}
              nextPageText={"›"}
              onChange={(pageNumber) => changePage(pageNumber)}
              innerClass="flex flex-row py-5 justify-center items-center gap-8"
              itemClass="inline-block w-10 h-10 border rounded flex justify-center items-center rounded-3xl hover:bg-[#ff4400] hover:text-white hover:border-none"
              activeClass="pagination-active text-black"
            />
          </div>
          <div className="mt-[100px]">
            <label>
              <div className="flex flex-row py-5 gap-5 px-20 mx-auto items-center">
                <Button
                  variant="basicBtn2"
                  size="md"
                  label="최신순"
                  onClick={() => orderChangeGift("desc")}
                />
                <Button
                  variant="basicBtn2"
                  size="md"
                  label="과거순"
                  onClick={() => orderChangeGift("asc")}
                />
              </div>
            </label>
            <MyVerifiedBox gifts={gifts} />
            <div className="w-full flex flex-row py-2 gap-5 justify-center items-center">
              <Pagination
                activePage={page}
                itemsCountPerPage={10}
                totalItemsCount={giftTotalPage * 10}
                pageRangeDisplayed={5}
                prevPageText={"‹"}
                nextPageText={"›"}
                onChange={(pageNumber) => handlePageChange(pageNumber)}
                innerClass="flex flex-row py-5 justify-center items-center gap-8"
                itemClass="inline-block w-10 h-10 border rounded flex justify-center items-center rounded-3xl hover:bg-[#ff4400] hover:text-white hover:border-none"
                activeClass="pagination-active text-black"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyStoreList;
