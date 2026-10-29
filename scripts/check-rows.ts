import { adminData, isEmployeeRow, nextEmployeeId } from "../src/data/adminData";

console.log("next id:", nextEmployeeId(adminData.employees));
console.log("valid row accepted:", isEmployeeRow({ id: "EMP-009", name: "A", department: "HR", role: "X", salary: 1, status: "Active" }));
console.log("bad status rejected:", !isEmployeeRow({ id: "EMP-009", name: "A", department: "HR", role: "X", salary: 1, status: "Boss" }));
console.log("salary as text rejected:", !isEmployeeRow({ id: "EMP-009", name: "A", department: "HR", role: "X", salary: "1", status: "Active" }));
