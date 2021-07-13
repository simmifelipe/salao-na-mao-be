import axios from "axios";

const api = axios.create({
  baseURL: "https://api.pagar.me/1",
});

import { api_key } from "../data/keys.json";

export default async (endpoint: string, data: any) => {
  try {
    const response = await api.post(endpoint, {
      api_key,
      ...data,
    });

    return { error: false, data: response.data };
  } catch (err) {
    return {
      error: true,
      message: JSON.stringify(err.response.data.errors[0]),
    };
  }
};
