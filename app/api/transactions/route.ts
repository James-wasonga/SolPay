// import { NextResponse } from 'next/server';
// import { getAllTx, getTotalRevenue, getTodayRevenue } from '@/lib/transactions';

// export async function GET() {
//   const transactions = getAllTx();
//   const total = getTotalRevenue();
//   const today = getTodayRevenue();

//   return NextResponse.json({
//     transactions,
//     stats: {
//       total,
//       today,
//       count: transactions.filter((t) => t.status === 'confirmed').length,
//     },
//   });
// }


import { NextResponse } from 'next/server';
import { getAllTx, getTotalRevenue, getTodayRevenue } from '@/lib/db';

export async function GET() {
  const [transactions, total, today] = await Promise.all([
    getAllTx(),
    getTotalRevenue(),
    getTodayRevenue(),
  ]);

  return NextResponse.json({
    transactions,
    stats: {
      total,
      today,
      count: transactions.filter((t) => t.status === 'confirmed').length,
    },
  });
}