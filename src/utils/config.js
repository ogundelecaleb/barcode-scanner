//production server
// export const API_BASE_URL = 'http://94.229.79.27:55412/api/v1/accesss';

//live server
export const API_BASE_URL = 'https://bcrx-api.careapps.net';
export const getApiUrl = (endpoint) => API_BASE_URL + endpoint

export const ADDMEDICATION = getApiUrl('/pharmacy/inventory/new')
