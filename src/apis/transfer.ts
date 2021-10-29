import apiClient from "../utils/ApiClient";

export function updateStockTransfers( requestBody: any) {
    console.debug("stock transfer")
    console.debug(requestBody)
    return apiClient.post(`/stockTransfers`, requestBody);
}

export function getStockMovements(id: string) {
    return apiClient.get(`/stockMovements/`+id);
}