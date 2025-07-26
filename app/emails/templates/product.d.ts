interface NewProductVars {
    id: number | string;
    name: string;
    type: string;
    category: string;
    min: number;
    max: number;
    provider_price: number;
    provider_currency: string;
    price: number;
    provider: string;
    logo: string;
}
declare const newProduct: ({ id, name, type, category, min, max, provider_price, provider_currency, price, provider, logo, }: NewProductVars) => string;
export { newProduct };
