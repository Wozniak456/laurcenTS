import { db } from "@/db";
import Link from "next/link";
import Image from "next/image";
import deleteButton from "../../../../../public/icons/close-square-light.svg";
import newFileButton from "../../../../../public/icons/create.svg";
import { notFound } from "next/navigation";
import { getPageTitle } from "@/utils/pageTitle";
// import editButton from '../../../../../public/icons/edit.svg'
// import registerGoodsButton from '../../../../../public/icons/goods-in.svg'

// import PurchTableComponent from "@/components/PurchHeaders/purchtable-table"
// import SalesView from '@/components/SalesHeaders/sales-headers-view'

interface SaleLinesProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: getPageTitle("Рядки реалізації"),
};

export const dynamic = "force-dynamic";

export default async function SaleLines(props: SaleLinesProps) {
  const header = await db.salestable.findFirst({
    select: {
      id: true,
      doc_id: true,
      date_time: true,
      customers: true,
      saleslines: {
        select: {
          quantity: true,
          items: true,
          units: true,
        },
      },
    },
    where: {
      id: BigInt(props.params.id),
    },
  });

  if (!header) {
    notFound();
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 flex justify-center items-center">
      <div className="bg-white p-8 rounded shadow-lg w-3/5">
        <div className="flex flex-col gap-4 ">
          <div>
            <div className="flex justify-between mb-4">
              <h1 className="text-xl font-bold">
                Вибуткова накладна №{Number(header.id)}
              </h1>
              <div className="flex justify-end">
                <Link href={"/realization/headers/view"} className="">
                  <button className="hover:bg-blue-100  px-2 rounded ">
                    <Image
                      src={deleteButton}
                      alt="New Document Icon"
                      width={30}
                      height={30}
                      title="Це зображення видаляє елемент"
                    />
                  </button>
                </Link>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-100">
                  <th className="px-2 py-2 text-center border border-gray-400">
                    Doc ID
                  </th>
                  <th className="px-2 py-2 text-center border border-gray-400">
                    Delivery Date
                  </th>
                  <th className="px-2 py-2 text-center border border-gray-400">
                    Customer ID
                  </th>
                  <th className="px-2 py-2 text-center border border-gray-400">
                    Vendor Name
                  </th>
                  <th className="px-2 py-2 text-center border border-gray-400">
                    Status
                  </th>
                  <th
                    colSpan={3}
                    className="py-2 text-center border border-gray-400"
                  >
                    Edit
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-2 border border-gray-400 text-center">
                    {header.doc_id ? Number(header.doc_id) : ""}
                  </td>
                  <td className="px-2 py-2 border border-gray-400 text-center">
                    {header.date_time.toISOString().split("T")[0]}
                  </td>
                  <td className="px-2 py-2 border border-gray-400 text-center">
                    {header.customers.id}
                  </td>
                  <td className="px-2 py-2 border border-gray-400 text-center">
                    {header.customers.name}
                  </td>
                  <td className="px-2 py-2 border border-gray-400 text-center">
                    {header.saleslines.length === 0
                      ? "None"
                      : header.doc_id === null
                      ? "Saved"
                      : "Posted"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center ">
            <h1 className="text-xl font-bold">Рядки вибуткової накладної</h1>
            <Link href={`/realization/headers/${header.id}/new-line`}>
              <button className="hover:bg-blue-100 py-2 px-2 rounded">
                <Image
                  src={newFileButton}
                  alt="New Document Icon"
                  width={30}
                  height={30}
                  title="Це зображення видаляє елемент"
                />
              </button>
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-100">
                <th className="px-2 py-2 text-center border border-gray-400">
                  # Line
                </th>
                <th className="px-2 py-2 text-center border border-gray-400">
                  Item Id{" "}
                </th>
                <th className="px-2 py-2 text-center border border-gray-400">
                  Item name
                </th>
                <th className="px-2 py-2 text-center border border-gray-400">
                  Qty
                </th>
                <th className="px-2 py-2 text-center border border-gray-400">
                  Unit
                </th>
                <th
                  colSpan={3}
                  className="py-2 text-center border border-gray-400"
                >
                  Edit
                </th>
              </tr>
            </thead>
            <tbody>
              {header.saleslines.map((line, index) => (
                <tr key={index}>
                  <td className="px-2 py-2 border border-gray-400 text-center">
                    {index + 1}
                  </td>
                  <td className="px-2 py-2 border border-gray-400 text-center">
                    {line.items.id}
                  </td>
                  <td className="px-2 py-2 border border-gray-400 text-center">
                    {line.items.name}
                  </td>
                  <td className="px-2 py-2 border border-gray-400 text-center">
                    {line.quantity}
                  </td>
                  <td className="px-2 py-2 border border-gray-400 text-center">
                    {line.units.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
