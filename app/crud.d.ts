type Operator = "===" | "!==" | "in" | "contains" | "range";
type Condition = {
    field: string;
    operator: Operator;
    value: any;
};
type RawObject = Record<string, any>;
export type QueryObject = Condition | Condition[] | RawObject;
interface QueryOptions {
    find?: QueryObject;
    filter?: QueryObject;
    sort?: {
        property: string;
        order?: "asc" | "desc";
    };
    removeKeys?: string[];
    leaveKeys?: string[];
    limit?: number;
    offset?: number;
    or?: boolean;
}
declare const getDocs: (table: string, shop_id?: number | null, query?: QueryOptions) => Promise<any>;
declare const addShopDoc: (col: string, data: any, shop_id: number) => Promise<any>;
declare const addShopDocs: (col: string, docs: any[], shop_id: number) => Promise<any>;
declare const deleteShopDoc: (col: string, uid: string, shop_id: number) => Promise<void>;
declare const deleteShopDocs: (col: string, uids: string[], shop_id: number) => Promise<void>;
declare const updateShopDoc: (col: string, uid: string, newData: Record<string, any>, shop_id: number) => Promise<void>;
export { getDocs, addShopDoc, addShopDocs, deleteShopDoc, deleteShopDocs, updateShopDoc, };
