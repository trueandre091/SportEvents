const API_URL = 'https://app-container:5000';

export const fetchData = async (endpoint) => {
  const response = await fetch(`${API_URL}/${endpoint}`);
  const data = await response.json();
  return data;
};

export const postData = async (endpoint, body) => {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return data;
};
