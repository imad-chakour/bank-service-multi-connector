import api from "./axiosConfig";

const getCustomers = () => {
  return api.get("/all");
};

const createCustomer = (identityRef, firstname, lastname, username) => {
  return api.post("/create", {
    identityRef,
    firstname,
    lastname,
    username,
  });
};

const updateCustomer = (identityRef, firstname, lastname, username) => {
  return api.put("/update/" + identityRef, {
    firstname,
    lastname,
    username,
  });
};

const deleteCustomer = (identityRef) => {
  return api.delete("/delete/" + identityRef);
};

const CustomersService = {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};

export default CustomersService;

