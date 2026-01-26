import {
    ConnectWallet,
    Wallet,
    WalletDropdown,
    WalletDropdownLink,
    WalletDropdownDisconnect
} from '@coinbase/onchainkit/wallet';
import {
    Address,
    Avatar,
    Name,
    Identity,
    EthBalance,
} from '@coinbase/onchainkit/identity';

export function WalletWrapper({
    className,
    text = "Enter Nexus",
    withGreeting = false
}: {
    className?: string;
    text?: string;
    withGreeting?: boolean;
}) {
    return (
        <div className={className}>
            <Wallet>
                <ConnectWallet text={text} className="bg-axon-obsidian hover:bg-black text-white rounded-swiss font-extrabold" >
                    <Avatar className="h-6 w-6" />
                    <Name className="text-white" />
                </ConnectWallet>
                <WalletDropdown className="bg-white border border-gray-200 rounded-[20px] shadow-2xl p-2 min-w-[240px]">
                    <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                        <Avatar />
                        <Name />
                        <Address className="text-axon-steel" />
                        <EthBalance className="text-axon-obsidian font-bold" />
                    </Identity>
                    <WalletDropdownLink
                        icon="wallet"
                        href="https://keys.coinbase.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:bg-gray-50 rounded-xl"
                    >
                        Wallet Dashboard
                    </WalletDropdownLink>
                    <WalletDropdownDisconnect className="hover:bg-red-50 text-red-600 rounded-xl" />
                </WalletDropdown>
            </Wallet>
        </div>
    );
}
