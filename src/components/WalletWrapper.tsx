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
import { color } from '@coinbase/onchainkit/theme';

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
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <Address />
                    <EthBalance />
                </Identity>
                <WalletDropdownLink
                    icon="wallet"
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
