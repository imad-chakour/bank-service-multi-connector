import axios from "axios";
import AuthService from "./auth.service";

const accountsApi = axios.create({
  baseURL: "http://localhost:8080/api/rest/bank",
});

accountsApi.interceptors.request.use(
  (config) => {
    const user = AuthService.getCurrentUser();
    if (user && user.jwtToken) {
      config.headers.Authorization = `Bearer ${user.jwtToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const getAccounts = () => {
  return accountsApi.get("/all");
};

const getAccountByRib = (rib) => {
  return accountsApi.get("?rib=" + rib);
};

const createAccount = (accountData) => {
  return accountsApi.post("/create", accountData);
};

const transfer = (fromRib, toRib, amount) => {
  return axios.post("http://localhost:8080/api/rest/transaction/create", {
    fromRib,
    toRib,
    amount
  }, {
    headers: {
      'Authorization': `Bearer ${AuthService.getCurrentUser()?.jwtToken}`
    }
  });
};

const AccountsService = {
  getAccounts,
  getAccountByRib,
  createAccount,
  transfer
};

export default AccountsService;
