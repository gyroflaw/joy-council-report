import axios from "axios";

const api = axios.create({ baseURL: "https://status.joystream.org/" });

export const getOfficialTotalSupply = async () => {
  const { data } = await api.get<number>("/total-supply");
  return data;
};

export const getOfficialCirculatingSupply = async () => {
  const { data } = await api.get<number>("/circulating-supply");
  return data;
};
