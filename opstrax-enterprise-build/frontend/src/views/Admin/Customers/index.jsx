
export { default as CustomerList } from "./CustomerList";
export { default as CustomerProfile } from "./CustomerProfile";

// keep this for backward compat if any calls use the object default
import CustomerList from "./CustomerList";
export default CustomerList; 
