import { useState } from "react";
import Popup from "reactjs-popup";
import Select from "react-select";

const AuctionNft = (props) => {

    const [basePrice, setBasePrice] = useState(0);
    const [quickBuyPrice, setQuickBuyPrice] = useState(0);
    const [days, setDays] = useState(0);

    const noOfDays = [
        { value: 1, label: "1 Day" },
        { value: 3, label: "3 Days" },
        { value: 5, label: "5 Days" },
    ];

    return (
        <Popup trigger={<button className="mt-2 py-1 w-full bg-yellow-200 text-md lg:text-lg xl:text-xl 2xl:text-2xl rounded-lg">AUCTION</button>} modal nested>
            <div className="flex bg-white p-3" >
                <img src={props.nft.image} width={300} height={300} />
                <div className="p-4">
                    <p>Name: {props.nft.name}</p>
                    <p>Description: {props.nft.description}</p>
                    <p>Price: {props.nft.price}</p>
                    <form className="grid">
                        <input
                            className="mt-1 rounded p-2"
                            style={{ background: "#FFFFFF40 0% 0% no-repeat padding-box" }}
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            placeholder="Bid start price"
                            onChange={(e) => setBasePrice(e.target.value)}
                        />
                        <input
                            className="mt-1 rounded p-2"
                            style={{ background: "#FFFFFF40 0% 0% no-repeat padding-box" }}
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            placeholder="Quick Buy price"
                            onChange={(e) => setQuickBuyPrice(e.target.value)}
                        />
                        <Select
                            className="mt-1 rounded"
                            // styles={colourStyles}
                            isSearchable={false}
                            options={noOfDays}
                            value={days}
                            onChange={(e) => setDays(e)}
                        />
                    </form>
                    <button className="bg-yellow-400 mt-4 w-full" onClick={() => props.setTokenForAuction(props.nft.tokenId, basePrice, quickBuyPrice, days)}>Auction Token</button>
                </div>
            </div>
        </Popup>
    )
}

export default AuctionNft;