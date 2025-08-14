import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Progress,
} from "@nextui-org/react";
import { db } from "@/db";
import { getActivePoolsCount } from "@/utils/poolUtils";
import {
  PoolIcon,
  BatchIcon,
  ReportIcon,
  FeedingIcon,
  PurchaseIcon,
  VendorIcon,
  CostIcon,
  StockIcon,
  SummaryIcon,
  FishingIcon,
} from "@/components/icons";
import Link from "next/link";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

export const dynamic = "force-dynamic";

// Dashboard KPI Cards Component
function KPICard({
  title,
  value,
  subtitle,
  icon,
  color = "primary",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "warning" | "danger";
}) {
  return (
    <Card className="w-full">
      <CardBody className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600">{title}</p>
            <p className="text-xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className={`text-${color} text-lg`}>{icon}</div>
        </div>
      </CardBody>
    </Card>
  );
}

// Quick Action Card Component
function QuickActionCard({
  title,
  description,
  href,
  icon,
  color = "primary",
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "warning" | "danger";
}) {
  return (
    <Link href={href}>
      <Card className="w-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardBody className="p-4">
          <div className="flex items-center gap-3">
            <div className={`text-${color} text-xl`}>{icon}</div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

// Recent Activity Component
function RecentActivity({ activities }: { activities: any[] }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <h3 className="text-lg font-semibold">Остання активність</h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export default async function Home() {
  const today = new Date().toISOString().split("T")[0];

  // Fetch dashboard data
  const [
    activePools,
    activeBatches,
    todayFeedings,
    feedStock,
    recentTransactions,
    lowStockItems,
  ] = await Promise.all([
    // Active pools (with fish quantity > 0)
    getActivePoolsCount(today),

    // Active fish batches
    db.itemtransactions
      .groupBy({
        by: ["batch_id"],
        where: {
          quantity: { gt: 0 },
          locations: {
            location_type_id: 2, // Assuming 2 is for fish locations
          },
        },
        _count: true,
      })
      .then((result) => result.length),

    // Today's feeding transactions
    db.itemtransactions.count({
      where: {
        documents: {
          date_time: {
            gte: new Date(today),
            lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000),
          },
          doc_type_id: 9, // Assuming 9 is feeding document type
        },
      },
    }),

    // Feed stock by feed type - more useful for operations
    db.itemtransactions
      .groupBy({
        by: ["batch_id"],
        where: {
          locations: {
            location_type_id: 1, // Warehouse location type
          },
          itembatches: {
            items: {
              feed_type_id: { not: null }, // Only feed items
            },
          },
        },
        _sum: {
          quantity: true,
        },
      })
      .then(async (result) => {
        const batchIds = result
          .filter((item) => (item._sum.quantity || 0) > 0)
          .map((item) => item.batch_id);

        // Get feed types and their total quantities
        const feedTypeStock = await db.itembatches.findMany({
          where: {
            id: { in: batchIds },
          },
          include: {
            items: {
              include: {
                feedtypes: true,
              },
            },
          },
        });

        // Group by feed type and sum quantities
        const feedTypeTotals = feedTypeStock.reduce((acc, batch) => {
          const feedType = batch.items.feedtypes?.name || "Unknown";
          const quantity =
            result.find((r) => r.batch_id === batch.id)?._sum.quantity || 0;
          acc[feedType] = (acc[feedType] || 0) + quantity;
          return acc;
        }, {} as Record<string, number>);

        return feedTypeTotals;
      }),

    // Recent transactions
    db.documents.findMany({
      take: 5,
      orderBy: { date_time: "desc" },
      include: {
        doctype: true,
        employees: true,
      },
    }),

    // Low stock by feed type - more useful for operations
    db.itemtransactions
      .groupBy({
        by: ["batch_id"],
        where: {
          locations: {
            location_type_id: 1, // Warehouse location type
          },
          itembatches: {
            items: {
              feed_type_id: { not: null }, // Only feed items
            },
          },
        },
        _sum: {
          quantity: true,
        },
      })
      .then(async (result) => {
        const batchIds = result
          .filter((item) => (item._sum.quantity || 0) > 0)
          .map((item) => item.batch_id);

        // Get feed types and their total quantities
        const feedTypeStock = await db.itembatches.findMany({
          where: {
            id: { in: batchIds },
          },
          include: {
            items: {
              include: {
                feedtypes: true,
              },
            },
          },
        });

        // Group by feed type and sum quantities
        const feedTypeTotals = feedTypeStock.reduce((acc, batch) => {
          const feedType = batch.items.feedtypes?.name || "Unknown";
          const quantity =
            result.find((r) => r.batch_id === batch.id)?._sum.quantity || 0;
          acc[feedType] = (acc[feedType] || 0) + quantity;
          return acc;
        }, {} as Record<string, number>);

        // Return feed types with low stock (< 100 kg total)
        return Object.entries(feedTypeTotals)
          .filter(([_, total]) => total < 100)
          .map(([feedType, total]) => ({ feedType, total }))
          .slice(0, 5);
      }),
  ]);

  // Format recent activities
  const recentActivities = recentTransactions.map((doc) => ({
    description: `${doc.doctype.name} - Employee ${doc.employees.id}`,
    time: format(new Date(doc.date_time), "dd MMM HH:mm", { locale: uk }),
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Ласкаво просимо до LaursenAC
        </h1>
        <p className="text-blue-100">
          Система управління аквакультурою •{" "}
          {format(new Date(), "EEEE, d MMMM yyyy", { locale: uk })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard
          title="Всього басейнів"
          value={activePools}
          subtitle="активних"
          icon={<PoolIcon />}
          color="primary"
        />
        <KPICard
          title="Активних партій"
          value={activeBatches}
          subtitle="риби"
          icon={<BatchIcon />}
          color="success"
        />
        <KPICard
          title="Годувань сьогодні"
          value={todayFeedings}
          subtitle="операцій"
          icon={<FeedingIcon />}
          color="warning"
        />
        <KPICard
          title="Кормів на складі"
          value={`${Object.keys(feedStock).length} типів`}
          subtitle="активних типів кормів"
          icon={<StockIcon />}
          color="secondary"
        />
      </div>

      {/* Feed Stock by Type */}
      {Object.keys(feedStock).length > 0 && (
        <div className="col-span-full">
          <h2 className="text-xl font-semibold mb-4">
            Запаси кормів за типами
          </h2>
          <div className="grid grid-cols-7 gap-3">
            {Object.entries(feedStock)
              .sort(([a], [b]) => {
                // Extract numeric value from feed type (e.g., "0.5 mm" -> 0.5)
                const aNum = parseFloat(a.split(" ")[0]);
                const bNum = parseFloat(b.split(" ")[0]);
                return aNum - bNum; // Sort numerically ascending
              })
              .map(([feedType, quantity]) => {
                // Check if this feed type is low in stock
                const isLowStock = lowStockItems.some(
                  (item) => item.feedType === feedType
                );
                return (
                  <Card
                    key={feedType}
                    className={`w-full ${
                      isLowStock ? "bg-red-50 border-red-200" : ""
                    }`}
                  >
                    <CardBody className="p-2 text-center">
                      <div
                        className={`text-sm font-semibold mb-1 ${
                          isLowStock ? "text-red-600" : "text-blue-600"
                        }`}
                      >
                        {feedType}
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          isLowStock ? "text-red-700" : ""
                        }`}
                      >
                        {quantity.toFixed(0)} кг
                      </div>
                      {isLowStock && (
                        <div className="text-xs text-red-600 font-semibold mt-1">
                          Низький запас!
                        </div>
                      )}
                    </CardBody>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Швидкі дії</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickActionCard
              title="Годування (дні)"
              description="Управління щоденним годуванням"
              href={`/summary-feeding-table/day/${today}`}
              icon={<FeedingIcon />}
              color="warning"
            />
            <QuickActionCard
              title="Керування басейнами"
              description="Управління басейнами по днях"
              href={`/pool-managing/day/${today}`}
              icon={<PoolIcon />}
              color="primary"
            />
            <QuickActionCard
              title="Партії риби"
              description="Перегляд та управління партіями"
              href="/batches/view"
              icon={<BatchIcon />}
              color="success"
            />
            <QuickActionCard
              title="Склад кормів"
              description="Залишки та інвентаризація"
              href="/leftovers/view"
              icon={<StockIcon />}
              color="secondary"
            />
            <QuickActionCard
              title="Загальний звіт"
              description="Загальний звіт по днях"
              href="/general-summary/day-selection"
              icon={<ReportIcon />}
              color="primary"
            />
            <QuickActionCard
              title="Собівартість"
              description="Аналіз витрат"
              href="/cost-report"
              icon={<CostIcon />}
              color="danger"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <RecentActivity activities={recentActivities} />
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Основні розділи</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link href="/pools/actions">
            <Card className="w-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardBody className="p-4 text-center">
                <div className="text-blue-600 text-2xl mb-2">
                  <PoolIcon />
                </div>
                <h3 className="font-semibold">Басейни</h3>
                <p className="text-xs text-gray-600">Управління басейнами</p>
              </CardBody>
            </Card>
          </Link>

          <Link href="/batches/view">
            <Card className="w-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardBody className="p-4 text-center">
                <div className="text-green-600 text-2xl mb-2">
                  <BatchIcon />
                </div>
                <h3 className="font-semibold">Риба</h3>
                <p className="text-xs text-gray-600">Партії та управління</p>
              </CardBody>
            </Card>
          </Link>

          <Link href="/purchtable/view">
            <Card className="w-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardBody className="p-4 text-center">
                <div className="text-orange-600 text-2xl mb-2">
                  <PurchaseIcon />
                </div>
                <h3 className="font-semibold">Корми</h3>
                <p className="text-xs text-gray-600">Закупівлі та склад</p>
              </CardBody>
            </Card>
          </Link>

          <Link href="/general-summary/day-selection">
            <Card className="w-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardBody className="p-4 text-center">
                <div className="text-purple-600 text-2xl mb-2">
                  <ReportIcon />
                </div>
                <h3 className="font-semibold">Звіти</h3>
                <p className="text-xs text-gray-600">Аналітика та звіти</p>
              </CardBody>
            </Card>
          </Link>

          <Link href="/system/parameters">
            <Card className="w-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardBody className="p-4 text-center">
                <div className="text-gray-600 text-2xl mb-2">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <h3 className="font-semibold">Система</h3>
                <p className="text-xs text-gray-600">Налаштування</p>
              </CardBody>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
