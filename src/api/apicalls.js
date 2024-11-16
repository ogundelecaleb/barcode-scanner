
import { ADDMEDICATION } from "../utils/config";
import { apiDelete, apiGet, apiGetCSV, apiPost, apiPut } from "../utils/utils";

//transaction

//medictation
export function createMedication(data) {
  return apiPost(ADDMEDICATION, data);
}







