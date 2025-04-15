/**
 * Comprehensive Field Mapping: Report Template Columns <==> SQL Query Fields
 *
 * This mapping is based on the columns extracted from the provided report template screenshots.
 * For each column, we list:
 *   - Ukrainian column name (as in the template)
 *   - English translation (for clarity)
 *   - SQL field mapping (if any, from FeedingMetrics or query)
 *   - Notes (e.g., partial mapping, unmapped, needs redesign)
 *
 * Use this table to compare the report template to the SQL output and identify what needs to be added or changed.
 */

export const reportFieldMappings = [
  // --- Quantitative Fish Data Section ---
  {
    ua: "К-ть зариблено, шт після розплідника",
    en: "Stocked qty after hatchery",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "Кількість шт (вага 1-3 гр)",
    en: "Qty (1-3g)",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "К-ть шт (вага 4-50 гр)",
    en: "Qty (4-50g)",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "К-ть шт (вага 50-150гр)",
    en: "Qty (50-150g)",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "К-ть відсортованих х шт (вага 1-150 гр)",
    en: "Sorted qty (1-150g)",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "К-ть мертвих шт (вага 1-150 гр)",
    en: "Dead qty (1-150g)",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "К-ть шт (вага 150-450 гр)",
    en: "Qty (150-450g)",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "К-ть шт (вага від 450 гр)",
    en: "Qty (>450g)",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "К-ть відсортованих х шт (вага 150-450 гр)",
    en: "Sorted qty (150-450g)",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "К-ть мертвих шт (вага 150-450 гр)",
    en: "Dead qty (150-450g)",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "Сума мертвих загалом шт",
    en: "Total dead qty",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "К-ть шт переведених у цю партію",
    en: "Qty transferred to this batch",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "К-ть шт переведених з цієї партії",
    en: "Qty transferred from this batch",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "К-ть шт продано на поточну дату",
    en: "Qty sold to date",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "К-ть шт на залишку",
    en: "Qty in stock",
    sql: null,
    notes: "Unmapped",
  },
  { ua: "Дата", en: "Date", sql: "feeding_date", notes: "Mapped" },

  // --- Feed by Type Section (repeat for each feed type) ---
  {
    ua: "Корм A ... кг",
    en: "Feed A ... kg",
    sql: "total_feed_quantity (filtered by feed_type_name)",
    notes: "Partial, needs aggregation by feed type",
  },
  {
    ua: "Корм A ... грн",
    en: "Feed A ... UAH",
    sql: "total_feed_cost (filtered by feed_type_name)",
    notes: "Partial, needs aggregation by feed type",
  },
  // ... repeat for each feed type as needed ...

  // --- Feed Efficiency by Weight Category Section ---
  {
    ua: "До 5 гр грн корм/шт риби",
    en: "Up to 5g UAH feed/fish",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "5-10 грам грн корм/шт риби",
    en: "5-10g UAH feed/fish",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "10-50 гр грн корм/шт риби",
    en: "10-50g UAH feed/fish",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "50-150 грам кг корму/кг риби",
    en: "50-150g kg feed/kg fish",
    sql: "feed_per_fish (filtered by weight_category)",
    notes: "Partial, only for some categories",
  },
  {
    ua: "50-150 грам грн корм/кг риби",
    en: "50-150g UAH feed/kg fish",
    sql: "feed_cost_per_fish (filtered by weight_category)",
    notes: "Partial, only for some categories",
  },
  {
    ua: "150-450 кг корму/кг риби",
    en: "150-450g kg feed/kg fish",
    sql: "feed_per_fish (filtered by weight_category)",
    notes: "Partial, only for some categories",
  },
  {
    ua: "150-450 грн корм/кг риби",
    en: "150-450g UAH feed/kg fish",
    sql: "feed_cost_per_fish (filtered by weight_category)",
    notes: "Partial, only for some categories",
  },
  {
    ua: "450-800 кг корму/кг риби",
    en: "450-800g kg feed/kg fish",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "450-800 грн корм/кг риби",
    en: "450-800g UAH feed/kg fish",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "Вище 800 грам кг корму/кг риби",
    en: ">800g kg feed/kg fish",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "Вище 800 грам грн корм/кг риби",
    en: ">800g UAH feed/kg fish",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "Собівартість на момент I вилову",
    en: "Cost at first catch",
    sql: null,
    notes: "Unmapped",
  },
  {
    ua: "Загальна собівартість всієї проданої риби партії",
    en: "Total cost of all sold fish in batch",
    sql: null,
    notes: "Unmapped",
  },
];

/**
 * Usage:
 * - Use this mapping to compare the report template to the SQL output.
 * - For each unmapped or partially mapped column, consider how to redesign the SQL query to provide the required data.
 * - Update this file and your code as you add new mappings.
 */
