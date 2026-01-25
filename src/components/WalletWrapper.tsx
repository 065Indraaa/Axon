import { WalletDefault } from '@coinbase/onchainkit/wallet';

export function WalletWrapper({ className }: { className?: string }) {
    return (
        <div className={className}>
            <WalletDefault />
        </div>
    );
}
