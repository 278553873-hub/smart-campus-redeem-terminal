interface PreloadCampaignImageOptions {
    timeoutMs?: number;
}

export const preloadCampaignImage = (
    imageUrl: string,
    { timeoutMs = 2400 }: PreloadCampaignImageOptions = {},
): Promise<boolean> => new Promise(resolve => {
    if (typeof Image === 'undefined' || !imageUrl) {
        resolve(false);
        return;
    }

    const image = new Image();
    let settled = false;
    const finish = (ready: boolean) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        image.onload = null;
        image.onerror = null;
        resolve(ready);
    };
    const decode = () => {
        if (typeof image.decode !== 'function') {
            finish(true);
            return;
        }
        image.decode().then(() => finish(true)).catch(() => finish(false));
    };
    const timeout = window.setTimeout(() => finish(false), timeoutMs);

    image.onload = decode;
    image.onerror = () => finish(false);
    image.src = imageUrl;
    if (image.complete && image.naturalWidth > 0) decode();
});
