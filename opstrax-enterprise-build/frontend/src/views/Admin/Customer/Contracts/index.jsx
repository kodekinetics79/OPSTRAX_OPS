import ContractList from "./ContractList"; // Assuming you might have split it, or if it is the content of index.jsx itself.
// Wait, I wrote the content of ContractList directly into index.jsx in step 183.
// So I should rename the current index.jsx content to ContractList.jsx and index.jsx should just export.
// ERROR CORRECTION: In step 186 I wrote to .../Contracts/index.jsx.
// I should split it.

export { default as ContractList } from "./ContractList";
export { default as ContractDetail } from "./ContractDetail";
