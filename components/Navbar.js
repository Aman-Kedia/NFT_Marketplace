import { useState, useEffect } from "react";
import Link from "next/link";
import { Web3Auth } from "@web3auth/modal";
import { WALLET_ADAPTERS } from "@web3auth/base";
import { ethers } from 'ethers'
import AccountDetails from "./AccountDetails";

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

const Navbar = () => {
    const [navbar, setNavbar] = useState(false);
    const [web3auth, setWeb3auth] = useState(null);
    const [provider, setProvider] = useState(null);
    const [address, setAddress] = useState("");
    const [dispAdr, setDispAdr] = useState("");
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        const init = async () => {
            try {
                const web3auth = new Web3Auth({
                    clientId,
                    web3AuthNetwork: "testnet",
                    chainConfig: {
                        chainNamespace: "eip155",
                        chainId: "0x13881",
                        rpcTarget: "https://rpc-mumbai.maticvigil.com",
                    },
                    uiConfig: {
                        theme: "light",
                        loginMethodsOrder: ["google", "linkedin", "github", "apple"],
                    },
                    defaultLanguage: "en",
                });

                setWeb3auth(web3auth);
                await web3auth.initModal({
                    modalConfig: {
                        [WALLET_ADAPTERS.OPENLOGIN]: {
                            label: "openlogin",
                            loginMethods: {
                                google: {
                                    showOnModal: true,
                                },
                                linkedin: {
                                    showOnModal: true,
                                },
                                github: {
                                    showOnModal: true,
                                },
                                apple: {
                                    showOnModal: true,
                                },
                                email_passwordless: {
                                    showOnModal: false,
                                },
                                facebook: {
                                    showOnModal: true,
                                },
                                twitter: {
                                    showOnModal: true,
                                },
                                discord: {
                                    showOnModal: true,
                                },
                                line: {
                                    showOnModal: false,
                                },
                                twitch: {
                                    showOnModal: false,
                                },
                                reddit: {
                                    showOnModal: false,
                                },
                                weibo: {
                                    showOnModal: false,
                                },
                                wechat: {
                                    showOnModal: false,
                                },
                                kakao: {
                                    showOnModal: false,
                                },
                            },
                        }
                    }
                });
                setProvider(web3auth.provider);
                window.provider = web3auth.provider;

                const ethersProvider = new ethers.providers.Web3Provider(web3auth.provider);
                const signer = ethersProvider.getSigner();
                const address = await signer.getAddress();
                setAddress(address)
                const displayAddr = address.slice(0, 4) + "..." + address.slice(-4);
                setDispAdr(displayAddr);

                let balance = ethers.utils.formatEther(
                    await ethersProvider.getBalance(address)
                );
                balance = balance.slice(0, 5)
                setBalance(balance)
            }
            catch (error) {
                console.log(error);
            }
        };

        init();
    }, []);

    const login = async () => {
        if (!web3auth) {
            console.log("web3auth not initialized yet");
            return;
        }
        const web3authProvider = await web3auth.connect();
        setProvider(web3authProvider);
        window.provider = web3authProvider;
        const ethersProvider = new ethers.providers.Web3Provider(web3authProvider);
        const signer = ethersProvider.getSigner();
        const address = await signer.getAddress();
        setAddress(address)
        const displayAddr = address.slice(0, 4) + "..." + address.slice(-4);
        setDispAdr(displayAddr);

        let balance = ethers.utils.formatEther(
            await ethersProvider.getBalance(address)
        );
        balance = balance.slice(0, 5)
        setBalance(balance)
        const cpath = router.asPath;
        if (cpath == "/ownedNFTs" || cpath == "/requests") {
            router.reload(window.location.pathname)
        }
    };

    const logout = async () => {
        if (!web3auth) {
            console.log("web3auth not initialized yet");
            return;
        }
        await web3auth.logout();
        setProvider(null);
        window.provider = null;
        const cpath = router.asPath;
        if (cpath == "/ownedNFTs" || cpath == "/requests") {
            router.reload(window.location.pathname)
        }
    };

    return (
        <div className="w-full opacity-100 sticky top-0 z-[100] bg-[#E3E6FF]" style={{ minheight: "10vh" }}>
            <nav>
                <div className="justify-between px-4 mx-auto lg:max-w-full md:items-center md:flex md:px-8">
                    <div>
                        <div className="flex items-center justify-between py-3 md:py-3 md:block">
                            <Link href="/">
                                <h2 className="text-2xl font-bold">
                                    <img src="DJ_logo.png" width={200} />
                                </h2>
                            </Link>
                            <div className="md:hidden">
                                <button
                                    className="p-2 text-gray-700 rounded-md outline-none focus:border-gray-400 focus:border"
                                    onClick={() => setNavbar(!navbar)}
                                >
                                    {navbar ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M4 6h16M4 12h16M4 18h16"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div
                            className={`flex-1 justify-self-center pb-3 mt-8 md:block md:pb-0 md:mt-0 ${navbar ? "block" : "hidden"
                                }`}
                        >
                            <ul className="items-center justify-center space-y-8 md:flex md:space-x-6 md:space-y-0">
                                <li
                                    className="text-[#2F281E]"
                                    style={{ fontFamily: "poppins" }}
                                >
                                    <Link href="/">Home</Link>
                                </li>
                                <li
                                    className="text-[#2F281E]"
                                    style={{ fontFamily: "poppins" }}
                                >
                                    <Link href="/auctionedNFTs">Auctions</Link>
                                </li>
                                <li
                                    className="text-[#2F281E]"
                                    style={{ fontFamily: "poppins" }}
                                >
                                    <Link href="/mint">Mint</Link>
                                </li>
                                <li
                                    className="text-[#2F281E]"
                                    style={{ fontFamily: "poppins" }}
                                >
                                    <Link href="/collections">Collection</Link>
                                </li>
                                <li
                                    className="text-[#2F281E]"
                                    style={{ fontFamily: "poppins" }}
                                >
                                    <Link href="/dashboard">Dashboard</Link>
                                </li>
                                {Boolean(address === "0x92Ba0f73f8ee7510486192E95DdBd8f77148D4A4") && (
                                    <li
                                        className="text-[#2F281E]"
                                        style={{ fontFamily: "poppins" }}
                                    >
                                        <Link href="/requests">Requests</Link>
                                    </li>
                                )}
                                <li>
                                    {provider ?
                                        <AccountDetails dispAdr={dispAdr} balance={balance} address={address} logout={logout} />
                                        :
                                        <button onClick={login} className='py-2 px-4 bg-[#0D1243] bg-no-repeat text-white border rounded-lg' style={{ fontFamily: 'poppins' }}>
                                            Connect Wallet <img src='wallet1.png' className='pl-1 inline-block' />
                                        </button>
                                    }
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;