import Link from 'next/link';
import Popup from 'reactjs-popup';

const AccountDetails = (props) => {

    return (
        <Popup trigger={
            <button className='py-2 px-4 bg-[#0D1243] bg-no-repeat text-white border rounded-lg opacity-100' style={{ fontFamily: 'poppins' }}>
                {props.dispAdr} <img src='profile1.png' className='pl-1 inline-block' />
            </button>
        } modal nested>
            {
                close => (
                    <div className='modal opacity-100'>
                        <table className="min-w-full bg-no-repeat table-fixed border-0">
                            <thead className="bg-[#4B4E73]">
                                <tr>
                                    <th className="whitespace-nowrap text-xl text-white font-medium py-1 pl-3 text-left" colSpan={2}>Account Details</th>
                                    <th className='text-right pr-4'>
                                        <button onClick={() => close()}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14.554" height="14.552" viewBox="0 0 21.554 21.552">
                                                <g id="noun-cancel-5382304" transform="translate(-15.962 -15.96)">
                                                    <g id="Group_12987" data-name="Group 12987" transform="translate(15.962 15.96)">
                                                        <path id="Path_9262" data-name="Path 9262" d="M53.358,32.862a1.812,1.812,0,0,0-2.562,0l-7.686,7.686-7.683-7.683a1.811,1.811,0,0,0-2.562,2.562l7.684,7.683L32.868,50.79a1.811,1.811,0,1,0,2.562,2.562l7.682-7.682,7.683,7.682a1.811,1.811,0,1,0,2.562-2.56l-7.683-7.683,7.686-7.686A1.812,1.812,0,0,0,53.358,32.862Z" transform="translate(-32.335 -32.331)" fill="#fff" />
                                                    </g>
                                                </g>
                                            </svg>
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-[#FFFFFF]">
                                    <td className="px-8"><img src="profile.png" width="80" height="80" /></td>
                                    <td className="whitespace-nowrap text-base text-[#666C7C] font-medium text-center">{props.dispAdr}</td>
                                    <td className="whitespace-nowrap text-base pl-8 text-[#FF7949] font-semibold">Connected</td>
                                </tr>
                                <tr className="border-y border-gray-300 bg-[#FFFFFF]">
                                    <td className="pl-4 py-2 flex font-semibold text-[#262628]"><img src="polygon.png" className='mr-2' width="30" height="30" />{props.balance} MATIC</td>
                                    <td colSpan={2}></td>
                                </tr>
                                <tr className="bg-[#FFFFFF]">
                                    <td className="px-12 pt-2"><button onClick={() => navigator.clipboard.writeText(props.address)}><img src="copy.png" /></button></td>
                                    <td className="px-10 pt-2"><Link href="https://faucet.polygon.technology/" target="_blank"><img src="wallet.png" width="50" height="50" /></Link></td>
                                    <td className="px-10 pt-3"><button onClick={props.logout}><img src="logout.png" width="50" height="50" /></button></td>
                                </tr>
                                <tr className="bg-[#FFFFFF]">
                                    <td className="text-center whitespace-nowrap text-sm font-medium"><button onClick={() => navigator.clipboard.writeText(props.address)}>Copy</button></td>
                                    <td className="text-center whitespace-nowrap text-sm font-medium"><Link href="https://faucet.polygon.technology/" target="_blank">Get Faucet</Link></td>
                                    <td className="text-center whitespace-nowrap text-sm font-medium"><button onClick={props.logout}>Disconnect</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )
            }
        </Popup>
    );
}

export default AccountDetails;