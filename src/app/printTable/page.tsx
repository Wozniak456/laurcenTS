// // pages/index.tsx
// import React from 'react';
// import ExportButton from '@/components/tableToPrint';

// type DataItem = {
//   name: string;
//   age: number;
//   email: string;
// };

// const data: DataItem[] = [
//   { name: 'John Doe', age: 28, email: 'john.doe@example.com' },
//   { name: 'Jane Smith', age: 34, email: 'jane.smith@example.com' },
//   // додайте більше даних, якщо потрібно
// ];

// const HomePage: React.FC = () => (
//   <div>
//     <h1>My Table</h1>
//     <table>
//       <thead>
//         <tr>
//           <th>Name</th>
//           <th>Age</th>
//           <th>Email</th>
//         </tr>
//       </thead>
//       <tbody>
//         {data.map((row, index) => (
//           <tr key={index}>
//             <td>{row.name}</td>
//             <td>{row.age}</td>
//             <td>{row.email}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//     <ExportButton data={data} filename="my-data.xlsx" />
//   </div>
// );

// export default HomePage;
