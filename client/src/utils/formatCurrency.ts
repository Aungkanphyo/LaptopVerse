const kyatFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
});

export const formatPrice = (price: number | undefined | null): string => {
    if (price === undefined || price === null || isNaN(price)) {
        return '0 Ks';
    }
    return `${kyatFormatter.format(price)} Ks`;
};