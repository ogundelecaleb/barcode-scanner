
import { ADDMEDICATION, GETUSER } from "../utils/config";
import { apiDelete, apiGet, apiGetCSV, apiPost, apiPut } from "../utils/utils";

//transaction

//medictation
export function createMedication(data) {
  return apiPost(ADDMEDICATION, data);
}
export function getUser(data) {
  return apiGet(GETUSER, data);
}







