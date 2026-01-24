import {
    ConnectWallet,
    Wallet,
    WalletDropdown,
    WalletDropdownDisconnect,
    WalletDropdownLink
} from '@coinbase/onchainkit/wallet';
import {
    Address,
    Avatar,
    Name,
    Identity,
    EthBalance
} from '@coinbase/onchainkit/identity';

export function WalletWrapper({ className }: { className?: string }) {
    return (
        <Wallet>
            <ConnectWallet
                className={`w-full h-full flex items-center justify-center ${className}`}
            >
                <Avatar className="h-6 w-6" />
                <Name className="text-white" />
            </ConnectWallet>
            <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2">
                    <Avatar />
                    <Name />
                    <Address hasCopyAddressOnClick />
                    <EthBalance />
                </Identity>
                <WalletDropdownLink
                    href="https://keys.coinbase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Wallet
                </WalletDropdownLink>
                <WalletDropdownDisconnect />
            </WalletDropdown>
        </Wallet>
    );
}
