/**
 * Suppress errors from browser extensions that interfere with the application
 * This is a workaround for third-party extensions like Smart Unit Converter
 * that inject content scripts and may cause errors in the console
 */
export function suppressExtensionErrors() {
    const originalError = console.error;

    console.error = (...args: any[]) => {
        // Filter out known extension errors
        const errorMessage = args.join(' ');

        // List of patterns to suppress
        const suppressPatterns = [
            'content.bundle.js',
            'content-script.js',
            'Smart Unit Converter',
            'Cannot read properties of null'
        ];

        // Check if error matches any suppression pattern
        const shouldSuppress = suppressPatterns.some(pattern =>
            errorMessage.includes(pattern)
        );

        // Only log if not suppressed
        if (!shouldSuppress) {
            originalError.apply(console, args);
        }
    };
}
