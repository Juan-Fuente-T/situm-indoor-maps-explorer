export default async function checkImage(url: string): Promise<boolean> {
    return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => {
            // Si tiene tamaño, existe imagen real
            if (img.width > 10 && img.height > 10) resolve(true);
            else resolve(false);
        };

        img.onerror = () => resolve(false);
        img.src = url;
    });
}