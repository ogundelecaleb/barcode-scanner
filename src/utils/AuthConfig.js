//production server
//export const API_BASE_URL = 'http://localhost:3379';

//live server
export const API_BASE_URL = 'https://bcrx-api.careapps.net';
export const getApiUrl = (endpoint) => API_BASE_URL + endpoint

export const LOGIN = getApiUrl('/pharmacy/auth/login')

