# Query Optimization Notes — Chat Feature

## Problem: EXTRACT() kills index usage

PostgreSQL B-tree indexes on `transaction_date` are useless when the
WHERE clause wraps the column in `EXTRACT()`:

```sql
-- BAD: Seq Scan (index ignored)
SELECT type, SUM(amount)
FROM transactions
WHERE user_id = $1
  AND EXTRACT(month FROM transaction_date) = 6
  AND EXTRACT(year FROM transaction_date) = 2026
GROUP BY type;

-- GOOD: Index Scan on ix_transactions_user_date
SELECT type, SUM(amount)
FROM transactions
WHERE user_id = $1
  AND transaction_date >= '2026-06-01'
  AND transaction_date < '2026-07-01'
GROUP BY type;
```

## Indexes added

| Index | Columns | Used by |
|-------|---------|---------|
| `ix_transactions_user_date` | (user_id, transaction_date) | summary, daily, compare_months |
| `ix_transactions_user_category` | (user_id, category_id, transaction_date) | budget_status spent calc |
| `ix_transactions_user_type_date` | (user_id, type, transaction_date) | spending_by_category, recent_transactions |
| `ix_transactions_user_date_amount` | (user_id, transaction_date, amount) | top_transactions ORDER BY amount |
| `ix_budgets_user_month_year` | (user_id, month, year) | budget_status lookup |

## Verification (run against live DB)

```sql
-- 1. Monthly summary — should show Index Scan
EXPLAIN ANALYZE
SELECT type, SUM(amount), COUNT(id)
FROM transactions
WHERE user_id = 'xxx'
  AND transaction_date >= '2026-06-01'
  AND transaction_date < '2026-07-01'
GROUP BY type;

-- 2. Spending by category — should show Index Scan
EXPLAIN ANALYZE
SELECT c.name, SUM(t.amount), COUNT(t.id)
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.user_id = 'xxx'
  AND t.type = 'expense'
  AND t.transaction_date >= '2026-06-01'
  AND t.transaction_date < '2026-07-01'
GROUP BY c.id, c.name
ORDER BY SUM(t.amount) DESC
LIMIT 10;

-- 3. Top transactions — should show Index Scan + Sort
EXPLAIN ANALYZE
SELECT t.amount, t.type, t.description, t.transaction_date, c.name
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.user_id = 'xxx'
  AND t.transaction_date >= '2026-06-01'
  AND t.transaction_date < '2026-07-01'
ORDER BY t.amount DESC
LIMIT 5;

-- 4. Recent transactions — should show Backward Index Scan
EXPLAIN ANALYZE
SELECT t.amount, t.type, t.description, t.transaction_date, c.name
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.user_id = 'xxx'
ORDER BY t.transaction_date DESC
LIMIT 10;
```

## Expected query plans

With ~10K transactions per user:
- **Before** (EXTRACT): Seq Scan → ~50-100ms
- **After** (date range): Index Scan → ~1-5ms

The improvement scales with table size. At 100K+ rows the
difference becomes 10-100x.
