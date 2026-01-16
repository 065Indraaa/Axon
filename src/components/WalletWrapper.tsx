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

export function WalletWrapper({ className, withWalletAggregator = false }: { className?: string, withWalletAggregator?: boolean }) {
    return (
        <Wallet>
            <ConnectWallet
                withWalletAggregator={withWalletAggregator}
                className={className}
            >
                <Avatar className="h-6 w-6" />
                <Name />
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
